const { verifyToken } = require('../utils/jwt');
const UnauthorizedError = require('../errors/unauthorized-error');

module.exports = (req, res, next) => {
  const { jwt } = req.cookies;
  if (!jwt) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
  let payload;
  try {
    payload = verifyToken(jwt);
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
  req.user = payload;
  next();
};
