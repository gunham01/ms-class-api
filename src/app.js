const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const { vnuaRouter } = require('./routes/vnua.routing');
const msteamRouter = require('./routes/msteams.routing');
const { authenticationRouter } = require('./routes/auth.routing');
const { msalClient } = require('./graph');
require('./cronjob');

const app = express();
/**
 * @typedef {express.Request} Request
 * @typedef {express.Response} Response
 * @typedef {express.NextFunction} NextFunction
 */

// Create msal application object
// @ts-ignore
app.locals.msalClient = msalClient;

function handleError() {
  return (err, req, res, next) => {
    console.error(err);
    res.status(500).send('Có lỗi xảy ra');
  };
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

/**
 * Routing
 */
app.use('/api/vnua', vnuaRouter);
app.use('/api/msteam', msteamRouter);
app.use('/api/auth', authenticationRouter);

// catch 404 and forward to error handler
app.use((_req, _res, next) => {
  next(createError(404));
});

app.use(handleError);

// error handler
app.use((err, req, res, _next) => {
  console.error(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send(err);
  // res.render("error");
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception: ' + err);
});

module.exports = app;
