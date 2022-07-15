const { BrowserController } = require("./browser.controller");
const { WebCrawler } = require("./web-crawler");

class ChromeWebCrawler {
  static async initialize() {
    const webDriver = await BrowserController.openChromeWebDriver();
    return new WebCrawler(webDriver);
  }
}

module.exports = {
  ChromeWebCrawler,
};
