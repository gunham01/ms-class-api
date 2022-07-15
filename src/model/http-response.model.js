const { HttpStatus } = require("../utils/http.utils");

class HttpResponse {
  _status;
  _body;

  constructor({ status, body }) {
    this._status = status;
    this._body = body;
  }

  get status() {
    return this._status;
  }

  get body() {
    return this._body;
  }

  get good() {
    return Math.floor(this._status / 100) < 4;
  }

  get bad() {
    return Math.floor(this._status / 100) > 3;
  }

  /**
   * @param {number} status mã HTTP
   */
  static status(status) {
    return new HttpResponseBuilder().status(status);
  }

  static ok(body) {
    return new HttpResponseBuilder().status(HttpStatus.OK).body(body);
  }

  static badRequest(body) {
    return new HttpResponseBuilder().status(HttpStatus.BAD_REQUEST).body(body);
  }

  static unauthorizedRequest(body) {
    return new HttpResponseBuilder().status(HttpStatus.UNAUTHORIZED).body(body);
  }
}

class HttpResponseBuilder {
  _status;

  constructor() {}

  status(status) {
    this._status = status;
    return this;
  }

  body(body) {
    if (!this._status) throw new Error("Status is empty!");
    return new HttpResponse({ status: this._status, body: body });
  }
}

module.exports = {
  HttpResponse,
  HttpStatus,
  HttpResponseBuilder,
};
