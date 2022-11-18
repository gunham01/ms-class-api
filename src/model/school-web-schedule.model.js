/**
 * @typedef {import("./school-web-event.model").SchoolWebEvent} SchoolWebEvent
 */

class SchoolWebSchedule {
  /**
   * @type {string}
   */
  teacherId;
  /**
   * @type {number}
   */
  semesterId;

  /**
   * @type {SchoolWebEvent[]}
   */
  events;

  /**
   * @type {string}
   */
  scheduleHash;

  /**
   *
   * @param {SchoolWebSchedule} param0
   */
  constructor({ teacherId, semesterId, events, scheduleHash }) {
    this.teacherId = teacherId;
    this.semesterId = semesterId;
    this.events = events;
    this.scheduleHash = scheduleHash;
  }
}

module.exports = {
  SchoolWebSchedule,
};
