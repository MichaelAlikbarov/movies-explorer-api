require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');
const cors = require('cors');
const cookeParser = require('cookie-parser');
const routes = require('./routes/index');
const limiter = require('./middlewares/rateLimit');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

const { NODE_ENV, PORT, DB_URL } = process.env;
let port;
let dburl;

const app = express();
app.use(limiter);
app.use(helmet());
app.use(cookeParser());
app.use(express.json());

mongoose.connect(NODE_ENV === 'production' ? dburl = DB_URL : dburl = 'mongodb://127.0.0.1:27017/bitfilmsdb', {
  useNewUrlParser: true,
}).then(() => {
  console.log(`connected to ${dburl}`);
});

// console.log(mongoose.Error);

app.use(requestLogger);

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(routes);

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(NODE_ENV === 'production' ? port = PORT : port = 3000, () => {
  console.log(`app listening on port${port}`);
});
