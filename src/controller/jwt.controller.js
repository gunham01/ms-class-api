const { HttpResponse, HttpStatus } = require("../model/http-response.model");
const { JwtManager } = require("../security/jwt-manager");
const express = require("express");

class JwtController {

  /**
   * @param {express.Request} request
   */
  authenticateAccessToken(request) {
    const accessToken = this.getAccessToken(request);
    if (!accessToken) {
      return HttpResponse.unauthorizedRequest("Thiếu access token");
    }
    
    try {
      JwtManager.verifyAccessToken(accessToken);
      return HttpResponse.ok("Xác thực thành công");
    } catch (error) {
      console.log("Tu choi")
      return HttpResponse.status(HttpStatus.FORBIDDEN).body("Truy cập bị từ chối");
    }
  }

  getAccessToken(request) {
    const authorizationHeader = request.headers.authorization;
    return authorizationHeader ? authorizationHeader.split(" ")[1] : null;
  }
}

module.exports = {
  JwtController,
};
