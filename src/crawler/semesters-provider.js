const { By, WebElement } = require("selenium-webdriver");
const { ChromeWebCrawler } = require("./chrome.web-crawler");
const DateUtils = require("../utils/date.utils");
const { Semester } = require("../model/semester.model");
const moment = require("moment");
const { SchoolScheduleHelpler } = require("./school-schedule.helpler");

class SemesterProvider {
  _semesterDropdownListHTMLId = "ctl00_ContentPlaceHolder1_ctl00_ddlChonNHHK";
  _textContainsSemesterStartDateElementId = "ctl00_ContentPlaceHolder1_ctl00_lblNote";

  async getSemesters() {
    try {
      await this.prepareToReadSemesters();
      console.log("Prepare done");
      let semesters = await this.readSemestersFromWeb();
      console.log("Read semesters done");
      await this._webCrawler.close();
      console.log("Closed and quited");
      return this.setActiveSemesterIn(semesters);
    } catch (error) {
      // console.log("Error when read semesters: ", error);
      throw error;
    }
  }

  async prepareToReadSemesters() {
    this._webCrawler = await ChromeWebCrawler.initialize();

    try {
      const semestersWebUrl = `http://daotao.vnua.edu.vn/default.aspx?page=thoikhoabieu&sta=1&id=637749`;
      await new SchoolScheduleHelpler(this._webCrawler).prepareToReadSemesters(semestersWebUrl);
    } catch (error) {
      console.error("error", error);
      await this._webCrawler.close();
      throw error;
    }
  }

  async getSemesterHTMLOptions() {
    const semesterDropdownList = await this._webCrawler.elementController.waitElementPresence(
      this._semesterDropdownListHTMLId
    );

    return await semesterDropdownList.findElements(By.css("option"));
  }

  async readSemestersFromWeb() {
    let semesters = [];
    let fetchedSemesterCount = 0;
    let totalSemesterCount = 0;
    const semesterStartDate = await this.getSemesterStartDate();

    do {
      const semesterOptions = await this.getSemesterHTMLOptions();
      if (totalSemesterCount === 0) {
        totalSemesterCount = semesterOptions.length;
      }

      const semester = await this.extractSemesterFrom(semesterOptions[fetchedSemesterCount]);
      semesters.push({ ...semester, ...{ startDate: semesterStartDate } });
      fetchedSemesterCount++;

      if (fetchedSemesterCount < totalSemesterCount) {
        await semesterOptions[fetchedSemesterCount].click();
        console.log("Click");
        await this._webCrawler.waitPageFinishesLoading();
        console.log("Finished waiting");
      }
    } while (fetchedSemesterCount < totalSemesterCount);

    return semesters;
  }

  /**
   * @param {WebElement} semesterHTMLOption
   * @returns
   */
  async extractSemesterFrom(semesterHTMLOption) {
    const [name, id, semesterStartDate] = await Promise.all([
      semesterHTMLOption.getText(),
      semesterHTMLOption.getAttribute("value"),
    ]);
    return new Semester({
      id: id,
      name: name,
    });
  }

  async getSemesterStartDate() {
    const noteElement = await this._webCrawler.elementController.getElementById(
      this._textContainsSemesterStartDateElementId
    );
    const noteContent = await noteElement.getText();
    return DateUtils.extractDateFromString(noteContent, "DD/MM/YYYY");
  }

  /**
   * @param {Semester[]} semesters
   */
  setActiveSemesterIn(semesters) {
    let latestValidStartDateMoment = moment("01-01-1990", "DD-MM-YYYY");
    let activeSemesterIndex = 0;

    semesters.forEach((semester, index) => {
      const semesterStartDateInMoment = moment(semester.startDate);
      const newLatestDateIsValid = semesterStartDateInMoment.isAfter(latestValidStartDateMoment);
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
