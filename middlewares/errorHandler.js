const errorHandler = (err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).send({
      status: 'error',
      message: err.message,
    });
  } else {
    res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
  next();
};

module.exports = errorHandler;
