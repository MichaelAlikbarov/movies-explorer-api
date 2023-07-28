const router = require('express').Router();
const userRoutes = require('./users');
const movieRoutes = require('./movies');
const { createUser, login, logout } = require('../controllers/users');
const auth = require('../middlewares/auth');
const {
  validationLogin,
  validationCreateUser,
} = require('../middlewares/validationHandler');
const { NotFoundError } = require('../errors/not-found-error');

router.post('/signup', validationCreateUser, createUser);
router.post('/signin', validationLogin, login);
router.post('/signout', logout);

router.use(auth);

router.use('/users', userRoutes);
router.use('/movies', movieRoutes);

router.use('*', (req, res, next) => {
  next(new NotFoundError('page not found'));
});

module.exports = router;
