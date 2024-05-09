const { By, WebElement } = require('selenium-webdriver');
const { ChromeWebCrawler } = require('./chrome.web-crawler');
const DateUtils = require('../utils/date.utils');
const { Semester } = require('../model/semester.model');
const moment = require('moment');
const { SchoolScheduleHelpler } = require('./school-schedule.helpler');
const { PromiseUtils } = require('../utils/promise.utils');

class SemesterProvider {
  _semesterDropdownListHTMLId = 'ctl00_ContentPlaceHolder1_ctl00_ddlChonNHHK';
  _textContainsSemesterStartDateElementId =
    'ctl00_ContentPlaceHolder1_ctl00_lblNote';

  /**
   * @public
   * {Promise<Semester[]>}
   * @returns {Promise<any[]>}
   */
  async getSemesters() {
    await this.prepareToReadSemesters();
    let semesters = await this.readSemestersFromWeb();
    await this._webCrawler.close();
    return this.setActiveSemesterIn(semesters);
  }

  /**
   * @private
   */
  async prepareToReadSemesters() {
    this._webCrawler = await ChromeWebCrawler.initialize();
    try {
      const semestersWebUrl = `http://daotao.vnua.edu.vn/default.aspx?page=thoikhoabieu&sta=1&id=CNP02`;
      await new SchoolScheduleHelpler(this._webCrawler).prepareToReadSemesters(
        semestersWebUrl,
      );
    } catch (error) {
      console.error('error', error);
      await this._webCrawler.close();
      throw error;
    }
  }

  /**
   * @private lấy các thẻ options để chọn học kỳ
   */
  async getSemesterHTMLOptions() {
    const semesterDropdownList =
      await this._webCrawler.elementController.waitElementPresence(
        this._semesterDropdownListHTMLId,
      );

    return await semesterDropdownList.findElements(By.css('option'));
  }

  /**
   * @private Lấy thông tin các học kỳ trên web
   * @returns {Promise<Semester[]>}
   */
  async readSemestersFromWeb() {
    let semesters = [];
    let fetchedSemesterCount = 0;
    let totalSemesterCount = 0;
    await this._webCrawler.elementController.waitElementPresence(
      this._semesterDropdownListHTMLId,
      3000,
    );
    const semesterStartDate = await this.getSemesterStartDate();

    do {
      const semesterOptions = await this.getSemesterHTMLOptions();
      if (totalSemesterCount === 0) {
        totalSemesterCount = semesterOptions.length;
      }

      const semester = await this.extractSemesterFrom(
        semesterOptions[fetchedSemesterCount],
      );
      semesters.push({
        ...semester,
        startDate: semesterStartDate,
      });
      fetchedSemesterCount++;

      if (fetchedSemesterCount < totalSemesterCount) {
        await PromiseUtils.delay(700);
        await semesterOptions[fetchedSemesterCount].click();
        await this._webCrawler.waitPageFinishesLoading();
      }
    } while (fetchedSemesterCount < totalSemesterCount);

    return semesters;
  }

  /**
   * @pirvate Lấy ra thông tin học kỳ từ thẻ option chọn học kỳ
   * @param {WebElement} semesterHTMLOption
   * @returns
   */
  async extractSemesterFrom(semesterHTMLOption) {
    const [name, id, semesterStartDate] = await Promise.all([
      semesterHTMLOption.getText(),
      semesterHTMLOption.getAttribute('value'),
      this.getSemesterStartDate(),
    ]);
    return new Semester({
      id: id,
      name: name,
      startDate: semesterStartDate,
    });
  }

  /**
   * @private
   * @returns {Promise<Date>}
   */
  async getSemesterStartDate() {
    const noteElement = await this._webCrawler.elementController.getElementById(
      this._textContainsSemesterStartDateElementId,
    );
    const noteContent = await noteElement.getText();
    return DateUtils.extractDateFromString(noteContent, 'DD/MM/YYYY');
  }

  /**
   * @private
   * @param {Semester[]} semesters
   */
  setActiveSemesterIn(semesters) {
    let latestValidStartDateMoment = moment('01-01-1990', 'DD-MM-YYYY');
    let activeSemesterIndex = 0;

    semesters.forEach((semester, index) => {
      const semesterStartDateInMoment = moment(semester.startDate);
      const newLatestDateIsValid = semesterStartDateInMoment.isAfter(
        latestValidStartDateMoment,
      );
      const semesterHasStarted = semesterStartDateInMoment.isBefore(moment());
      if (newLatestDateIsValid && semesterHasStarted) {
        activeSemesterIndex = index;
        latestValidStartDateMoment = semesterStartDateInMoment;
      }
    });

    semesters[activeSemesterIndex].isActive = true;
    return semesters;
  }
}

module.exports = {
  SemesterProvider,
};
