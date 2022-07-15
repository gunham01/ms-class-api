const { SchoolWebSchedule } = require("../model/school-web-schedule.model");
const { CryptoUtils, HashAlgorithm } = require("../utils/crypto.utils");
const { ChromeWebCrawler } = require("./chrome.web-crawler");
const { SchoolScheduleHelpler } = require("./school-schedule.helpler");

class TeacherScheduleProvider {
  static _webScheduleUrlPrefix = "http://daotao.vnua.edu.vn/default.aspx?page=thoikhoabieu&sta=1&id=";
  static _resourceLocations = {
    myJquery: "./src/resource/js/MyJQuery.js",
    captcha: "./src/resource/js/captcha.js",
    readSchedule: "./src/resource/js/readSchedule.js",
    readStudentList: "./src/resource/js/readStudentList.js",
  };

  constructor() {
    this._webCrawler = null;
  }

  /**
   * Lấy lịch giảng dạy của giảng viên trong trang đào tạo
   * @param { string } teacherId: mã giảng viên
   * @param { string } semesterId: mã học kỳ
   * @returns lịch giảng dạy
   */
  async getSchedule(teacherId, semesterId) {
    await this.initialize(teacherId, semesterId);
    const teachingEvents = await this.getTeachingEvents();
    await this._webCrawler.close();

    return new SchoolWebSchedule({
      teacherId: teacherId,
      semesterId: semesterId,
      events: teachingEvents,
      scheduleHash: this.hashTeachingEvents(teachingEvents),
    });
  }

  /**
   * Băm các sự kiện giảng dạy
   * @param {any[]} teachingEvents các sự kiện giảng dạy
   */
  hashTeachingEvents(teachingEvents) {
    return CryptoUtils.createHash(JSON.stringify(teachingEvents), HashAlgorithm.SHA256);
  }

  /**
   * Khởi tạo mọi thứ
   * @param {string} teacherId mã giảng viên
   * @param {string} semesterId mã học kỳ
   */
  async initialize(teacherId, semesterId) {
    this._webCrawler = await ChromeWebCrawler.initialize();
    await this.navigateToTeacherWebSchedule(teacherId);

    await this.prepareToReadTeachingEvents(teacherId, semesterId);
  }

  /**
   * Chuẩn bị để đọc lịch
   * @param {string} semesterId mã học kỳ
   */
  async prepareToReadTeachingEvents(teacherId, semesterId) {
    try {
      await new SchoolScheduleHelpler(this._webCrawler).prepareToReadTeachingEvents(teacherId, semesterId);
    } catch (error) {
      await this._webCrawler.close();
      throw error;
    }
  }

  /**
   * @param {string} teacherId
   */
  async navigateToTeacherWebSchedule(teacherId) {
    const currentTeacherScheduleUrl = this.getWebScheduleUrl(teacherId);
    await this._webCrawler.navigateTo(currentTeacherScheduleUrl);
  }

  /**
   * @param {string} teacherId
   */
  getWebScheduleUrl(teacherId) {
    return `${TeacherScheduleProvider._webScheduleUrlPrefix}${teacherId}`;
  }

  async getTeachingEvents() {
    let teachingEvents = await this.readScheduleOnWeb();
    teachingEvents = await this.getStudentsOfTeachingEvents(teachingEvents);
    return teachingEvents;
  }

  /**
   * Đọc lịch giảng dạy
   * @returns lịch giảng dạy
   */
  async readScheduleOnWeb() {
    try {
      return this._webCrawler.scriptExecutor.executeScript(TeacherScheduleProvider._resourceLocations.readSchedule);
    } catch (error) {
      await this._webCrawler.close();
      console.error("error when reading schedule: ", error);
      throw new Error("Lỗi khi đọc thời khóa biểu");
    }
  }

  /**
   * Thêm danh sách sinh viên vào các sự kiện giảng dạy
   * @param teachingEvents các sự kiện giảng dạy
   * @returns các sự kiện giảng dạy đi kèm với danh sách sinh viên tương ứng
   */
  async getStudentsOfTeachingEvents(teachingEvents) {
    for (const event of teachingEvents) {
      event.students.value = await this.readStudentList(event.students.listUrl);
    }

    return teachingEvents;
  }

  /**
   * Đọc danh sách sinh viên từ link
   * @param {string} studentListUrl link danh sách sinh viên
   * @returns danh sách sinh viên
   */
  async readStudentList(studentListUrl) {
    await this._webCrawler.navigateTo(studentListUrl);
    try {
      return this._webCrawler.scriptExecutor.executeScript(TeacherScheduleProvider._resourceLocations.readStudentList);
    } catch (error) {
      await this._webCrawler.close();
      console.error("error when reading student list: ", error);
      throw new Error("Lỗi khi đọc danh sách sinh viên");
    }
  }
}

module.exports = {
  TeacherScheduleProvider,
};
