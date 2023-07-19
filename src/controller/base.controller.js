const { AxiosError } = require('axios');

class BaseController {
  /**
   *
   * @param {Error | AxiosError} error
   * @param {{prefix: string }} [options]
   */
  logError(error, options) {
    if (options?.prefix) {
      console.log(options.prefix);
    }

    const errorLog =
      error instanceof AxiosError
        ? {
            url: error.request.path,
            body: error.config.data,
            errorContent: error.response?.data?.error,
          }
        : error;

    console.dir(errorLog, { depth: null });
    return errorLog;
  }
}

module.exports = {
  BaseController,
};
