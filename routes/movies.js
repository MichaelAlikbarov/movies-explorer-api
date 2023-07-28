const router = require('express').Router();
const {
  getMovies,
  createMovie,
  deleteMovieId,
} = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', createMovie);
router.delete('/:movieId', deleteMovieId);

module.exports = router;
