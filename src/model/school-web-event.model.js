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
   * @type {string}
   */
  subjectGroup;

  /**
   * @type {number}
   */
  credit;

  /**
   * @type {number | undefined}
   */
  practiceGroup;

  /**
   * @type {number}
   */
  dayOfWeekIndex;

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
   * @typedef {import("./student.model").Student} Student
   * @typedef {{listUrl: string, value: Student[]}} StudentList
   * @type {StudentList}
   */
  students;
}

module.exports = {
  SchoolWebEvent,
};
