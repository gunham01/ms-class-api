const express = require("express");
const { ControllerFactory } = require("../controller/controller-factory");
const { RouterUtils } = require("./utils/router.utils");

const authenticationRouter = express.Router();
authenticationRouter.post("/app-login", login);
authenticationRouter.post("/register", register);

/**
 * @param {express.Request} request
 * @param {express.Response} response
 */
async function login(request, response) {
  const { email, password } = request.body;
  const serverAuthenticationResponse = await ControllerFactory.userController.authenticate(email, password);
  if (serverAuthenticationResponse.body.msLoginRequire) {
    const msLoginUrlResponse = await ControllerFactory.msteamsController.signIn(request)
    serverAuthenticationResponse.body.msLoginUrl = msLoginUrlResponse.body;
  }

  RouterUtils.response(response, serverAuthenticationResponse);
}

/**
 * @param {express.Request} request
 * @param {express.Response} response
 */
async function register(request, response) {
  const user = request.body;
  const serverRegisterResponse = await ControllerFactory.userController.insert(user);
  RouterUtils.response(response, serverRegisterResponse);
}

module.exports = {
  authenticationRouter,
};
