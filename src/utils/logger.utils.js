const { AxiosError } = require('axios');
const fs = require('fs/promises');

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
    await this.logToFile(JSON.stringify(errorLog, null, 2));
    return errorLog;
  }

  static logToFile(error) {
    return fs.writeFile(`${process.cwd()}/src/log/error.log`, error, { flag: 'a' });
  }
}

module.exports = { Logger };
