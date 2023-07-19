const { HttpResponse, HttpStatus } = require('../../model/http-response.model');
const { ControllerFactory } = require('../../controller/controller-factory');
const { validationResult } = require('express-validator');
const { JwtManager } = require('../../security/jwt-manager');

class RouterUtils {
  /**
   *
   * @param {import("express").Response} expressResposneObj
   * @param {HttpResponse} serverHttpResponse
   */
  static response(expressResposneObj, serverHttpResponse) {
    expressResposneObj
      .status(serverHttpResponse.status)
      .send(serverHttpResponse.body);
  }

  /**
   * @param {import("express").Request} request
   * @param {import("express").Response} response
   * @param {import("express").NextFunction} next
   */
  static authenticateAccessToken(request, response, next) {
    const authentcateTokenResponse =
      ControllerFactory.jwtController.authenticateAccessToken(request);
    if (authentcateTokenResponse.bad) {
      response
        .status(authentcateTokenResponse.status)
        .send(authentcateTokenResponse.body);
      response.end();
      return;
    }

    request['user'] = JwtManager.decodeToken(
      RouterUtils.getAccessToken(request)
    );
    next();
  }

  /**
   * @param {import("express").Request} request
   * @param {import("express").Response} response
   * @param {import("express").NextFunction} next
   */
  static verifyJwtExisted(request, response, next) {
    const tokenVerificationResponse =
      ControllerFactory.jwtController.verifyAccessTokenExisted(request);
    if (tokenVerificationResponse.bad) {
      response
        .status(tokenVerificationResponse.status)
        .send(tokenVerificationResponse.body);
      response.end();
      return;
    }

    next();
  }

  /**
   * @public
   * @param {import("express").Request} request
   */
  static getAccessToken(request) {
    const authorizationHeader = request.headers.authorization;
    return authorizationHeader ? authorizationHeader.split(' ')[1] : null;
  }

  /**
   * @param {import("express").Request} request
   * @param {import("express").Response} respond
   * @param {import("express").NextFunction} next
   */
  static respondWithRequestValidationErrorIfAny(request, respond, next) {
    const validationErrors = validationResult(request);
    if (!validationErrors.isEmpty()) {
      const validationErrorsContent = validationErrors.array();
      respond.status(HttpStatus.BAD_REQUEST).json(validationErrorsContent);
      respond.end();
      return;
    }

    next();
  }
}

module.exports = {
  RouterUtils,
};
