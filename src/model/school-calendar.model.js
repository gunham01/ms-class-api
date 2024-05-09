class SchoolCalendar {
  /**
   * @type {number}
   */
  id;

  /**
   * @type {string}
   */
  teacherId;

  /**
   * @type {string}
   */
  semesterId;

  /**
   * @type {Date}
   */
  createdAt = new Date();

  /**
   * @type {Date}
   */
  updatedAt = new Date();

  constructor({ teacherId, semesterId, createdAt = new Date() }) {
    this.teacherId = teacherId;
    this.semesterId = semesterId;
    this.createdAt = createdAt;
    this.updatedAt = new Date();
  }
}

module.exports = {
  SchoolCalendar,
};
