/**
 *  Model cua lịch lấy từ trang Đào tạo
 */
class SchoolWebEvent {
  /**
   * @type {string}
   */
  subjectId;

  /**
   * @type {string}
   */
  subjectName;

  /**
   * @type {number}
   */
  subjectGroup;

  /**
   * @type {number}
   */
  credit;

  /**
   * @type {SchoolWebEventOccurrence[]}
   */
  occurrences;

  /**
   * @typedef {import("./student.model").Student} Student
   * @type {{listUrl: string, value: Student[]}}
   */
  students;

  /**
   * @type {{index: number, startYear: number, endYear: number, startDate: Date}}
   */
  semester;

  /**
   * @type {boolean}
   */
  hasOnlineMeeting;
}

class SchoolWebEventOccurrence {
  /**
   * @type {number[]}
   */
  dayOfWeeks;

  /**
   * @type {number}
   */
  startPeriod;

  /**
   * @type {number}
   */
  endPeriod;

  /**
   * @type {string}
   */
  weekStr;

  /**
   * @type {string}
   */
  location;

  /**
   * @type {string | null}
   */
  practiceGroup;

  /**
   * @typedef {import('../model/student.model').Student} StudentModel
   * @type {{listUrl: string, value: StudentModel[]}}
   */
  students;
}

module.exports = {
  SchoolWebEvent,
  SchoolWebEventOccurrence
};
