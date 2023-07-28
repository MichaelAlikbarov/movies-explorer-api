const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');
const BadRequestError = require('../errors/bad-request-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const getUsersMe = (req, res, next) => {
  const _id = req.user;
  User.findById(_id)
    .then((user) => {
      const { name, email } = user;
      return res.status(200).send(name, email);
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user, { name, email }, { new: true, runValidators: true })
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequestError(`${Object.values(err.errors)
            .map(() => err.message).join(', ')}`),
        );
      } next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10, (err, hash) => User.create({
    name, email, password: hash,
  }).then((userNew) => res.status(201).send(userNew))
    .catch(() => {
      if (err.name === 11000) {
        return next(new ConflictError('Пользователь уже существует'));
      } next(err);
    }));
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findOne({ email }).select('+password')
    .then((user) => {
      const userId = user._id.valueOf();
      if (!user) {
        return new UnauthorizedError('Такого пользователя не существует');
      }
      bcrypt.compare(password, user.password, (err, isPasswordMatch) => {
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
