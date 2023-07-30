const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');
const NotFoundError = require('../errors/not-found-error');

const getUsersMe = (req, res, next) => {
  const userId = req.user;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return new NotFoundError('Пользователь не найден');
      }
      const { name, email } = user;
      return res.status(200).send({ name, email });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user, { name, email }, { new: true, runValidators: true })
    .then((user) => res.status(201).send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequestError(`${Object.values(err.errors)
            .map(() => err.message).join(', ')}`),
        );
      } if (err.code === 11000) {
        return next(new ConflictError('Пользователь с таким email уже существует'));
      } return next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('Пользователь уже существует');
      }
      bcrypt.hash(password, 10, (err, hash) => User.create({
        name, email, password: hash,
      })
        .then((userNew) => res.status(201).send(userNew)))
        .catch((err) => {
          if (err.code === 11000) {
            return next(new ConflictError('Пользователь уже существует'));
          } return next(err);
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findOne({ email }).select('+password')
    .then((user) => {
      const userId = user._id.valueOf();
      if (!user) {
        return new UnauthorizedError('Такого пользователя не существует');
      }
      return bcrypt.compare(password, user.password, (err, isPasswordMatch) => {
        if (!isPasswordMatch) {
          return next(new UnauthorizedError('Неправильный логин или пароль'));
        }
        const token = generateToken(userId);
        res.cookie('jwt', token, {
          maxAge: 604800000,
          httpOnly: true,
          secure: true,
          sameSite: 'None',
        });
        return res.status(200).send({
          _id: user._id,
          name: user.name,
          email: user.email,
        });
      });
    })
    .catch(next);
};

const logout = (req, res) => {
  res.clearCookie('jwt', {
    sameSite: true,
  }).send({ message: 'Осуществлен выход из учетной записи' });
};

module.exports = {
  getUsersMe,
  updateUser,
  createUser,
  login,
  logout,
};
