const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
require('dotenv').config();
const { routerIndex } = require('./routes/index');
const usersRoutes = require('./routes/users.js');
const cardsRoutes = require('./routes/cards.js');
const NotFoundError = require('./errors/not-found-err');
const auth = require('./middlewares/auth');

const app = express();
const { PORT = 3000 } = process.env;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

const mongoDbUrl = 'mongodb://127.0.0.1:27017/mestodb';
const mongooseConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};

mongoose.connect(mongoDbUrl, mongooseConnectOptions);

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use(auth);

app.use('/users', auth, usersRoutes);
app.use('/cards', auth, cardsRoutes);

app.use('/', routerIndex);
app.use(errorLogger);

// Централизованная обработка ошибок
app.use(errors());

app.use(() => {
  throw new NotFoundError('The requested resource is not found');
});

// здесь обрабатываем все ошибки
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ message: err.message || 'Sorry, some error on server.' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
