const { Builder, Capabilities } = require("selenium-webdriver");
const { Options, ServiceBuilder, setDefaultService } = require("selenium-webdriver/chrome");
const chromedriver = require("chromedriver");
const { DriverService } = require("selenium-webdriver/remote");

class BrowserController {
  static async openChromeWebDriver() {
    // const driverService = new ServiceBuilder(chromedriver.path).build();
    // await this.setDefaultChromeService(driverService);
    const options = this.getWebDriverOptions();
    return await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .withCapabilities(Capabilities.chrome())
      .build();
  }

  /**
   * @param {DriverService} driverService
   */
  static async setDefaultChromeService(driverService) {
    if (driverService.isRunning) {
      await driverService.kill();
    }
  }

  static getWebDriverOptions() {
    const options = new Options();
    options.addArguments("--headless", "--no-sandbox");
    return options;
  }
}

module.exports = {
  BrowserController,
};
