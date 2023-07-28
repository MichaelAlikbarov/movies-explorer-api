const router = require('express').Router();
const {
  getUsersMe,
  updateUser,
} = require('../controllers/users');

const {
  validationUpdateUser,
  validationGetUserId,
} = require('../middlewares/validationHandler');

router.get('/me', validationGetUserId, getUsersMe);
router.patch('/me', validationUpdateUser, updateUser);

module.exports = router;
