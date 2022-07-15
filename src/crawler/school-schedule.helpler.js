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
   * @param {WebCrawler} webCrawler
   */
  constructor(webCrawler) {
    this._webCrawler = webCrawler;
  }

  async prepareToReadTeachingEvents(teacherId, semesterId) {
    const teachingScheduleWebUrl = `http://daotao.vnua.edu.vn/default.aspx?page=thoikhoabieu&sta=1&id=${teacherId}`;
    await this._webCrawler.navigateTo(teachingScheduleWebUrl);
    await this.handleAlertIfExists();
    await this.injectJQuery();
    const schoolWebHasCaptcha = await this.fillCaptchaIfExists();
    if (schoolWebHasCaptcha) {
      await this._webCrawler.navigateTo(url);
    }

    await this.selectSemester(semesterId);
    await this.selectOrderByPeriod();
  }
  
  async prepareToReadSemesters(anySchoolScheduleUrl) {
    await this._webCrawler.navigateTo(anySchoolScheduleUrl);
    await this.handleAlertIfExists();
    const schoolWebHasCaptcha = await this.fillCaptchaIfExists();
    if (schoolWebHasCaptcha) {
      await this._webCrawler.navigateTo(url);
    }
  }

  async handleAlertIfExists() {
    let alertMessage = await this._webCrawler.elementController.getAcceptMessageIfExistAndAcceptIt();
    if (alertMessage) {
      if (alertMessage === "Server đang tải lại dữ liệu. Vui lòng trở lại sau 15 phút!") {
        throw new Error(alertMessage);
      } else {
        throw new Error("Lỗi khi mở website thời khóa biểu");
      }
    }
  }

  async injectJQuery() {
    try {
      await this._webCrawler.scriptExecutor.executeScriptAsync(SchoolScheduleHelpler._jsFileLocations.myJquery);
    } catch (error) {
      throw new Error("Lỗi khi inject JQuery: " + error);
    }
  }

  async fillCaptchaIfExists() {
    try {
      return await this._webCrawler.scriptExecutor.executeScript(SchoolScheduleHelpler._jsFileLocations.captcha);
    } catch (error) {
      throw new Error("Lỗi khi tự động điền captcha: " + error);
    }
  }

  /**
   * Chọn mã học kỳ
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
