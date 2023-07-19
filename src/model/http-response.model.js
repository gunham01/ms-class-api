const { HttpStatus } = require("../utils/http.utils");

class HttpResponse {
  /**
   * @type {number}
   */
  _status;

  /**
   * @type {any}
   */
  _body;

  /**
   * @public
   * @param {{status: number, body: any}} param0
   */
  constructor({ status, body }) {
    this._status = status;
    this._body = body;
  }

  /**
   * @public
   */
  get status() {
    return this._status;
  }

  /**
   * @public
   */
  get body() {
    return this._body;
  }

  /**
   * @public
   */
  get good() {
    return Math.floor(this._status / 100) < 4;
  }

  /**
   * @public
   */
  get bad() {
    return Math.floor(this._status / 100) > 3;
  }

  /**
   * @param {number} status mã HTTP
   */
  static status(status) {
    return new HttpResponseBuilder().status(status);
  }

  /**
   * @public
   * @param {any} body
   * @returns {HttpResponse}
   */
  static ok(body) {
    return new HttpResponseBuilder().status(HttpStatus.OK).body(body);
  }

  /**
   *
   * @param {any} body
   * @returns {HttpResponse}
   */
  static badRequest(body) {
    return new HttpResponseBuilder().status(HttpStatus.BAD_REQUEST).body(body);
  }

  /**
   *
   * @param {any} body
   * @returns {HttpResponse}
   */
  static unauthorizedRequest(body) {
    return new HttpResponseBuilder().status(HttpStatus.UNAUTHORIZED).body(body);
  }
}

class HttpResponseBuilder {
  /**
   * @private
   * @type {number}
   */
  _status;

  constructor() {}

  /**
   * @public
   * @param {number} status
   * @returns {HttpResponseBuilder}
   */
  status(status) {
    this._status = status;
    return this;
  }

  /**
   * @public
   * @param {any} body
   * @returns {HttpResponse}
   */
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
