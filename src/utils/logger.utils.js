const { AxiosError } = require('axios');

class Logger {
  /**
   * @param {Error | AxiosError} error
   * @param {{message: string }} [options]
   */
  static logError(error, options) {
    if (options?.message) {
      console.log(`[ERROR] ${options.message}`);
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

module.exports = { Logger };
