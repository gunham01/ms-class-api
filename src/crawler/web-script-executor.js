const { WebDriver } = require("selenium-webdriver");
const { FileIOUtils } = require("../utils/file-io.utils");

class WebScriptExecutor {
  /**
   * @param {WebDriver} webDriver
   */
  constructor(webDriver) {
    this._driver = webDriver;
  }

  /**
   * Chạy script
   * @param {string} scriptLocation nơi để script
   */
  async executeScript(scriptLocation) {
    const scriptContent = await FileIOUtils.readFile(scriptLocation);
    return this._driver.executeScript(scriptContent);
  }

  /**
   * Chạy script
   * @param {string} scriptContent nơi để script
   */
  async executeScriptRaw(scriptContent) {
    return this._driver.executeScript(scriptContent);
  }

  /**
   * Chạy script một cách bất đồng bộ
   * @param {string} scriptLocation nơi để script
   * @param {number} timeOutInSeconds thời hạn theo đơn vị giây
   * @returns
   */
  async executeScriptAsync(scriptLocation, timeOutInSeconds = 0) {
    if (timeOutInSeconds > 0) {
      const timeOuts = await this._driver.manage().getTimeouts();
      this._driver.manage().setTimeouts({ ...timeOuts, ...{ script: timeOutInSeconds * 1000 } });
    }

    const scriptContent = await FileIOUtils.readFile(scriptLocation);
    return this._driver.executeAsyncScript(scriptContent);
  }
}

module.exports = {
  WebScriptExecutor,
};
