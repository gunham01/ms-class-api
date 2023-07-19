/**
 * @typedef {import("./school-web-event.model").SchoolWebEvent} SchoolWebEvent
 */

class SchoolWebSchedule {
  /**
   * @type {string}
   */
  teacherId;
  /**
   * @type {string}
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
   * @param {Required<SchoolWebSchedule>} init
   */
  constructor(init) {
    Object.assign(this, init);
  }
}

module.exports = {
  SchoolWebSchedule,
};
