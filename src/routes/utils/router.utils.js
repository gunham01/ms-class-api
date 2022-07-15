const { HttpResponse } = require("../../model/http-response.model");
const express = require("express");
const { ControllerFactory } = require("../../controller/controller-factory");

class RouterUtils {
  /**
   *
   * @param {express.Response} expressResposneObj
   * @param {HttpResponse} serverHttpResponse
   */
  static response(expressResposneObj, serverHttpResponse) {
    expressResposneObj.status(serverHttpResponse.status).send(serverHttpResponse.body);
  }

  static authenticateAccessToken(request, response, next) {
    const authentcateTokenResponse = ControllerFactory.jwtController.authenticateAccessToken(request);
    if (authentcateTokenResponse.bad) {
      response.status(authentcateTokenResponse.status).send(authentcateTokenResponse.body);      
      response.end();
    }

    next();
  }
}

module.exports = {
  RouterUtils,
};
