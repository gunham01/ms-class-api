const { AxiosError } = require('axios');
const fs = require('fs/promises');
const { errorMonitor } = require('stream');

class Logger {
  /**
   * @param {Error | AxiosError} error
   * @param {{message: string }} [options]
   */
  static async logError(error, options) {
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

    await Logger.logToFile(errorLog);
    return errorLog;
  }

  static logToFile(error) {
    return fs.writeFile('../logs/error.log', JSON.stringify(error, null, 2), {
      flag: 'a',
    });
  }
}

module.exports = { Logger };
