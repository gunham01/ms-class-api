let createError = require("http-errors");
let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
const msal = require("@azure/msal-node");
const helmet = require("helmet");
const cors = require("cors");

const { vnuaRouter } = require("./routes/vnua.routing");
const msteamRouter = require('./routes/msteams.routing');
const { authenticationRouter } = require("./routes/auth.routing");

let app = express();

// MSAL config
const msalConfig = {
  auth: {
    clientId: process.env.OAUTH_CLIENT_ID,
    authority: process.env.OAUTH_AUTHORITY,
    clientSecret: process.env.OAUTH_CLIENT_SECRET
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: msal.LogLevel.Verbose,
    }
  }
};

// Create msal application object
app.locals.msalClient = new msal.ConfidentialClientApplication(msalConfig);

function handleError() {
  return (err, res, req, next) => {
    console.error(err);
    res.status(500).send("Có lỗi xảy ra");
  };
}

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(helmet());

/**
 * Routing
 */
app.use("/api/vnua", vnuaRouter);
app.use("/api/msteam", msteamRouter);
app.use("/api/auth", authenticationRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

app.use(handleError);

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).send(err);
  // res.render("error");
});

process.on('uncaughtException', function(err) {
  console.log('Uncaught exception: ' + err);
});

module.exports = app;
