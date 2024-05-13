const { AxiosError } = require('axios');
const fs = require('fs/promises');

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
            request: {
              url: error.request.path,
              body: error.config.data,
            },
            responseBody: error.response?.data?.error,
          }
        : error;

    console.dir(errorLog, { depth: null });
    return errorLog;
  }

  static logToFile() {
    fs.writeFile('../logs/error.log', 'Error message', { flag: 'a' });
  }
}

module.exports = { Logger };
