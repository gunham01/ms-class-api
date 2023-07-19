const { By, until, WebDriver } = require("selenium-webdriver");

class WebElementController {
  /**
   * @param {WebDriver} webDriver
   */
  constructor(webDriver) {
    this._driver = webDriver;
  }

  /**
   * Lấy thông báo từ alert
   * @returns thông báo từ alert, hoặc `null` nếu không có
   */
  async getAcceptMessageIfExistAndAcceptIt() {
    const alert = await this.getAlert();
    if (alert) {
      const alertMessage = await alert.getText();
      alert.accept();
      return alertMessage;
    }

    return null;
  }

  /**
   * Lấy đối tượng alert
   * @returns đối tượng alert, hoặc `null` nếu không có
   */
  async getAlert() {
    try {
      return await this._driver.switchTo().alert();
    } catch (err) {
      return null;
    }
  }

  /**
   * Lấy HTML element theo ID
   * @param {string} id ID của HTML element
   * @param {number} timeOutInSeconds timeout theo giây
   */
  getElementById(id, timeOutInSeconds = 0) {
    if (timeOutInSeconds > 0) {
      return this.waitElementPresence(id, timeOutInSeconds);
    }

    return this._driver.findElement(By.id(id));
  }

  /**
   * Đợi HTML element xuất hiện
   * @param {string} id ID của HTML element cần đợi
   * @param {number} timeOutInSeconds thời gian đợi tối đa
   */
  async waitElementPresence(id, timeOutInSeconds = 0) {
    const desiredElement = await this._driver.findElement(By.id(id));
    return await this._driver.wait(until.elementIsVisible(desiredElement), timeOutInSeconds);
  }

  /**
   * Kiểm tra xem HTML element tồn tại không
   * @param {string} id ID của HTML element
   */
  async checkIfElementNotExists(id) {
    return (await this._driver.findElements(By.id(id))).length === 0;
  }
}

module.exports = {
  WebElementController,
};
