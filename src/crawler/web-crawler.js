const { WebDriver } = require('selenium-webdriver');
const { WebElementController } = require('./web-element-controller');
const { WebScriptExecutor } = require('./web-script-executor');

class WebCrawler {
  /**
   *
   * @param {WebDriver} webDriver
   */
  constructor(webDriver) {
    this._driver = webDriver;
    this._elementController = new WebElementController(webDriver);
    this._scriptExecutor = new WebScriptExecutor(webDriver);
  }

  get scriptExecutor() {
    return this._scriptExecutor;
  }

  get elementController() {
    return this._elementController;
  }

  /**
   * @param {string} url
   */
  async navigateTo(url) {
    await this._driver.get(url);
  }

  async close() {
    try {
      await this._driver.close();
    } catch (error) {
      console.error('Error when close web driver: ', error);
    }
  }

  async waitPageFinishesLoading() {
    this._driver.wait(this.isWebFinishedLoading, 30000);
  }

  async isWebFinishedLoading() {
    const webState = await this._scriptExecutor.executeScriptRaw(
      'return document.state',
    );
    return webState === 'complete';
  }
}

module.exports = {
  WebCrawler,
};
