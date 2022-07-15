class HttpStatus {
  static OK = 200;
  static CREATED = 201;

  static BAD_REQUEST = 400;
  static UNAUTHORIZED = 401;
  static FORBIDDEN = 403;
  static NOT_FOUND = 404;
  static CONFLICT = 409;

  static INTERNAL_SERVER_ERROR = 500;
}

module.exports = {
  HttpStatus,
};
