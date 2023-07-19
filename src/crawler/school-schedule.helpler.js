const { By } = require("selenium-webdriver");
const { WebCrawler } = require("./web-crawler");

class SchoolScheduleHelpler {
  static _jsFileLocations = {
    myJquery: "./src/resource/js/MyJQuery.js",
    captcha: "./src/resource/js/captcha.js",
  };
  static _webElementIds = {
    orderByPeriodRadioButton: "ctl00_ContentPlaceHolder1_ctl00_rad_ThuTiet",
    semesterDropdownListHTMLId: "ctl00_ContentPlaceHolder1_ctl00_ddlChonNHHK",
  };

  /**
   * @public
   * @param {WebCrawler} webCrawler
   */
  constructor(webCrawler) {
    this._webCrawler = webCrawler;
  }

  /**
   * @public
   * @param {string} teacherId 
   * @param {string} semesterId 
   */
  async prepareToReadTeachingEvents(teacherId, semesterId) {
    const teachingScheduleWebUrl = `http://daotao.vnua.edu.vn/default.aspx?page=thoikhoabieu&sta=1&id=${teacherId}`;

    await this._webCrawler.navigateTo(teachingScheduleWebUrl);
    await this.handleAlertIfExists();
    await this.injectJQuery();
    const schoolWebRequireCaptcha = await this.fillCaptchaIfExists();
    
    // Sau khi điền captcha, web sẽ tự động điều hướng tới trang chủ, nên mình phải điều hướng lại
    // tới trang thời khóa biểu
    if (schoolWebRequireCaptcha) {
      await this._webCrawler.navigateTo(teachingScheduleWebUrl);
    }

    await this.selectSemester(semesterId);
    await this.selectOrderByPeriod();
  }

  /**
   * @public
   * @param {string} anySchoolScheduleUrl 
   */
  async prepareToReadSemesters(anySchoolScheduleUrl) {
    await this._webCrawler.navigateTo(anySchoolScheduleUrl);
    await this.handleAlertIfExists();
    const schoolWebHasCaptcha = await this.fillCaptchaIfExists();
    if (schoolWebHasCaptcha) {
      await this._webCrawler.navigateTo(anySchoolScheduleUrl);
    }
  }

  /**
   * @private
   */
  async handleAlertIfExists() {
    let alertMessage = await this._webCrawler.elementController.getAcceptMessageIfExistAndAcceptIt();
    if (alertMessage) {
      throw new Error(alertMessage);
    }
  }

  /**
   * @private
   */
  async injectJQuery() {
    try {
      await this._webCrawler.scriptExecutor.executeScriptAsync(SchoolScheduleHelpler._jsFileLocations.myJquery);
    } catch (error) {
      throw new Error("Lỗi khi inject JQuery: " + error);
    }
  }

  /**
   * @private
   * @returns {Promise<boolean>}
   */
  async fillCaptchaIfExists() {
    try {
      return await this._webCrawler.scriptExecutor.executeScript(SchoolScheduleHelpler._jsFileLocations.captcha);
    } catch (error) {
      throw new Error("Lỗi khi tự động điền captcha: " + error);
    }
  }

  /**
   * @private Chọn mã học kỳ
   * @param {string} semesterId mã học kỳ
   */
  async selectSemester(semesterId) {
    const semesterHTMLSelect = await this._webCrawler.elementController.getElementById(
      SchoolScheduleHelpler._webElementIds.semesterDropdownListHTMLId
    );
    
    const semesterHTMLOption = (await semesterHTMLSelect.findElements(By.css(`option[value=\"${semesterId}\"]`)))[0];
    if (!semesterHTMLOption) {
      throw new Error(`Mã học kỳ ${semesterId} không tồn tại`);
    }

    await semesterHTMLOption.click();
  }

  /**
   * @private
   */
  async selectOrderByPeriod() {
    const orderByPeriodRadioButton = await this._webCrawler.elementController.getElementById(
      SchoolScheduleHelpler._webElementIds.orderByPeriodRadioButton,
      50
    );
    await orderByPeriodRadioButton.click();
  }
}

module.exports = {
  SchoolScheduleHelpler,
};
