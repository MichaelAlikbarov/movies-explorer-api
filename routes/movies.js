const router = require('express').Router();
const {
  getMovies,
  createMovie,
  deleteMovieId,
} = require('../controllers/movies');

const {
  validationDeleteMovieId,
  validationCreateMovie,
} = require('../middlewares/validationHandler');

router.get('/', getMovies);
router.post('/', validationCreateMovie, createMovie);
router.delete('/:movieId', validationDeleteMovieId, deleteMovieId);

module.exports = router;
