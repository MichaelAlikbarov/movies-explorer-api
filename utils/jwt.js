const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;

const generateToken = (id) => jwt.sign({
  id,
}, NODE_ENV === 'production' ? JWT_SECRET : 'unique-secret-key');

const verifyToken = (token) => jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'unique-secret-key', (err, decoded) => {
  if (err) return false;
  return decoded.id;
});

module.exports = {
  generateToken,
  verifyToken,
};
