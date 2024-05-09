const { SchoolWebSchedule } = require('../model/school-web-schedule.model');
const { CryptoUtils } = require('../utils/crypto.utils');
const { ChromeWebCrawler } = require('./chrome.web-crawler');
const { SchoolScheduleHelpler } = require('./school-schedule.helpler');
const { WebCrawler } = require('./web-crawler');
const { SchoolWebEvent } = require('../model/school-web-event.model');
const moment = require('moment');
const fs = require('fs/promises');
const { PromiseUtils } = require('../utils/promise.utils');
const { CRAWLER_CONFIG } = require('./crawler-config');

class TeacherScheduleProvider {
  /**
   * @private
   */
  static webScheduleUrlPrefix =
    'http://daotao.vnua.edu.vn/default.aspx?page=thoikhoabieu&sta=1&id=';

  /**
   * @private
   */
  static resourceLocations = {
    myJquery: './src/resource/js/MyJQuery.js',
    captcha: './src/resource/js/captcha.js',
    readSchedule: './src/resource/js/readSchedule.js',
    readStudentList: './src/resource/js/readStudentList.js',
    readSemesterStartDate: './src/resource/js/readSemesterStartDate.js',
  };

  /**
   * @private
   * @type {WebCrawler}
   */
  webCrawler;

  constructor() {
    this.webCrawler = null;
  }

  /**
   * @public Lấy lịch giảng dạy của giảng viên trong trang đào tạo
   * @param { string } teacherId: mã giảng viên
   * @param { string } semesterId: mã học kỳ
   * {Promise<SchoolWebSchedule>} lịch giảng dạy
   * @returns {Promise<any>} lịch giảng dạy
   */
  async getSchedule(teacherId, semesterId) {
    await this.initialize(teacherId, semesterId);
    const teachingEvents = await this.getTeachingEvents();
    await this.webCrawler.close();

    return new SchoolWebSchedule({
      teacherId: teacherId,
      semesterId: semesterId,
      events: teachingEvents,
      scheduleHash: this.hashTeachingEvents(teachingEvents),
    });
  }

  /**
   * @private Băm các sự kiện giảng dạy
   * @param teachingEvents các sự kiện giảng dạy
   * @returns {string}
   */
  hashTeachingEvents(teachingEvents) {
    return CryptoUtils.createHash(JSON.stringify(teachingEvents), 'sha256');
  }

  /**
   * @private Khởi tạo mọi thứ
   * @param {string} teacherId mã giảng viên
   * @param {string} semesterId mã học kỳ
   */
  async initialize(teacherId, semesterId) {
    this.webCrawler = await ChromeWebCrawler.initialize();
    await this.navigateToTeacherWebSchedule(teacherId);
    await this.prepareToReadTeachingEvents(teacherId, semesterId);
  }

  /**
   * @private Chuẩn bị để đọc lịch
   * @param {string} semesterId mã học kỳ
   */
  async prepareToReadTeachingEvents(teacherId, semesterId) {
    try {
      await new SchoolScheduleHelpler(
        this.webCrawler,
      ).prepareToReadTeachingEvents(teacherId, semesterId);
    } catch (error) {
      await this.webCrawler.close();
      throw error;
    }
  }

  /**
   * @private
   * @param {string} teacherId
   */
  async navigateToTeacherWebSchedule(teacherId) {
    const currentTeacherScheduleUrl = this.getWebScheduleUrl(teacherId);
    await this.webCrawler.navigateTo(currentTeacherScheduleUrl);
  }

  /**
   * @private
   * @param {string} teacherId
   * @returns {string}
   */
  getWebScheduleUrl(teacherId) {
    return `${TeacherScheduleProvider.webScheduleUrlPrefix}${teacherId}`;
  }

  /**
   * @private Đọc lịch từ web đào tạo và xử lý
   * @returns {Promise<SchoolWebEvent[]>}
   */
  async getTeachingEvents() {
    const semester = await this.readSemester();

    let teachingEvents = await this.readScheduleOnWeb();
    // await PromiseUtils.delay(999999)
    await this.getStudentsOfTeachingEvents(teachingEvents);
    teachingEvents = teachingEvents
      .filter((event) => event.students.value.length !== 0)
      .map((event) => ({ ...event, semester }));

    // await fs.writeFile(
    //   `${process.cwd()}/src/resource/json/teachingEvents.json`,
    //   JSON.stringify(teachingEvents),
    //   'utf-8',
    // );
    return teachingEvents;
  }

  /**
   * @private Đọc lịch giảng dạy
   * @returns lịch giảng dạy
   */
  async readScheduleOnWeb() {
    try {
      return this.webCrawler.scriptExecutor.executeScript(
        TeacherScheduleProvider.resourceLocations.readSchedule,
      );
    } catch (error) {
      await this.webCrawler.close();
      console.error('error when reading schedule: ', error);
      throw new Error('Lỗi khi đọc thời khóa biểu');
    }
  }

  async readSemester() {
    try {
      const { index, startDateStr, startYear, endYear } =
        await this.webCrawler.scriptExecutor.executeScript(
          TeacherScheduleProvider.resourceLocations.readSemesterStartDate,
        );
      return {
        index,
        startDate: moment(startDateStr, 'DD/MM/YYYY').toDate(),
        startYear,
        endYear,
      };
    } catch (error) {
      await this.webCrawler.close();
      console.error('Reading current semester failed!', error);
      throw new Error('Lỗi khi thông tin học kỳ hiện tại');
    }
  }

  /**
   * @private Thêm danh sách sinh viên vào các sự kiện giảng dạy
   * @param {SchoolWebEvent[]} teachingEvents các sự kiện giảng dạy
   * @returns {Promise<void>} các sự kiện giảng dạy đi kèm với danh sách sinh viên tương ứng
   */
  async getStudentsOfTeachingEvents(teachingEvents) {
    for (const event of teachingEvents) {
      event.students.value = await this.readStudentList(event.students.listUrl);
      for (const occurrence of event.occurrences) {
        if (!occurrence.practiceGroup) {
          occurrence.students = event.students;
        } else {
          const existingOccurrenceWithSamePracticeGroup =
            event.occurrences.find(
              (item) => item.practiceGroup === occurrence.practiceGroup,
            );
          if (existingOccurrenceWithSamePracticeGroup?.students.value) {
            occurrence.students.value =
              existingOccurrenceWithSamePracticeGroup.students.value;
          } else {
            occurrence.students.value = await this.readStudentList(
              occurrence.students.listUrl,
            );
          }
        }
      }
    }
  }

  /**
   * @private Đọc danh sách sinh viên từ link
   * @param {string} studentListUrl link danh sách sinh viên
   * @returns danh sách sinh viên
   */
  async readStudentList(studentListUrl) {
    await PromiseUtils.delay(CRAWLER_CONFIG.waitTime);
    await this.webCrawler.navigateTo(studentListUrl);
    try {
      await PromiseUtils.delay(CRAWLER_CONFIG.waitTime);
      return this.webCrawler.scriptExecutor.executeScript(
        TeacherScheduleProvider.resourceLocations.readStudentList,
      );
    } catch (error) {
      await this.webCrawler.close();
      console.error('error when reading student list: ', error);
      throw new Error('Lỗi khi đọc danh sách sinh viên');
    }
  }
}

module.exports = {
  TeacherScheduleProvider,
};
