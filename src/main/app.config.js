const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const http = require("http");
var debug = require('debug')('ms-team-ms_graph_api:server');
const { configRouting } = require("../routes/app.routing");

/**
 * Khởi tạo app Express
 * @param {number} port số cổng
 * @returns
 */
function initializeExpressApp(port) {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: `http://localhost:${process.env.GUI_PORT}` }));
  app.use(express.json());
  configRouting(app);

  const server = http.createServer(app);
  configServer(server);
}

/**
 * @param {http.Server} server
 */
function configServer(server) {
  server.on("error", onServerError);
  server.on("listtening", onListening);
  server.on("close", process.exit);
}

function onServerError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  handleErrorCode(error.code, bind);
  // handle specific listen errors with friendly messages
}

function handleErrorCode(code, bind) {
  switch (code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

module.exports = {
  initializeExpressApp,
};
