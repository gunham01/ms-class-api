const { HttpResponse, HttpStatus } = require('../model/http-response.model');
const { JwtManager } = require('../security/jwt-manager');
const express = require('express');
const { UserRepository } = require('../repository/user.repository');

class JwtController {
  /**
   * @private
   */
  userRepository = new UserRepository();

  /**
   * @public
   * @param {express.Request} request
   */
  authenticateAccessToken(request) {
    const accessToken = this.getAccessToken(request);
    if (!accessToken) {
      return HttpResponse.unauthorizedRequest('Thiếu access token');
    }

    try {
      JwtManager.verifyAccessToken(accessToken);
      return HttpResponse.ok('Xác thực thành công');
    } catch (error) {
      return HttpResponse.status(HttpStatus.FORBIDDEN).body(
        'Truy cập bị từ chối'
      );
    }
  }

  /**
   * @public
   * @param {express.Request} request
   */
  verifyAccessTokenExisted(request) {
    const accessToken = this.getAccessToken(request);
    if (!accessToken) {
      return HttpResponse.unauthorizedRequest('Thiếu access token');
    }

    return this.userRepository.isJwtExisted(accessToken)
      ? HttpResponse.ok()
      : HttpResponse.status(HttpStatus.FORBIDDEN).body('Truy cập bị từ chối');
  }

  /**
   * @public
   * @param {import("express").Request} request
   */
  getAccessToken(request) {
    const authorizationHeader = request.headers.authorization;
    return authorizationHeader ? authorizationHeader.split(' ')[1] : null;
  }
}

module.exports = {
  JwtController,
};
