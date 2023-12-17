class PromiseUtils {
  /**
   * Delay by `ms` milisecond
   * @param {number} ms
   */
  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = { PromiseUtils };
