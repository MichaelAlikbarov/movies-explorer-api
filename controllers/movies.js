const Movie = require('../models/movie');
const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    owner,
    movieId,
    nameRU,
    nameEN,
  })
    .then((movie) => res.status(201).send({ movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new BadRequestError(`${Object.values(err.errors)
            .map(() => err.message).join(', ')}`),
        );
      } return next(err);
    });
};

const getMovies = (req, res, next) => {
  const owner = req.user;
  Movie.find({ owner })
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

const deleteMovieId = (req, res, next) => {
  Movie.findById(
    req.params.movieId,
  )
    .orFail(new NotFoundError('Error: not found'))
    .then((movie) => {
      if (req.user === movie.owner.valueOf()) {
        return movie.deleteOne();
      }
      throw new ForbiddenError('Нельзя удалить чужой фильм');
    })
    .then((movie) => res.send({ movie }))
    .catch((err) => {
      if (err.message === 'NotFound') {
        return next(new NotFoundError('Error: not found'));
      }
      if (err.name === 'CastError') {
        return next(new BadRequestError('Error: bad request'));
      } return next(err);
    });
};

module.exports = {
  getMovies,
  deleteMovieId,
  createMovie,
};
