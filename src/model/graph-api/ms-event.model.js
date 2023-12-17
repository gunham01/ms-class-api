const { DAY_OF_WEEKS } = require('../../constant/date.constant');

/**
 * @typedef {{type: string;content: string;}} EventBody
 * @typedef {{datetime: string, timezone: string}} EventDate
 * @typedef {{type: string, interval: number, dayOfWeek: DAY_OF_WEEKS[]}} EventRecurrencePattern
 * @typedef {{type: string, start: string, end: string}} EventRecurrenceRange
 */

class MsEvent {
  /**
   * @type {string}
   */
  subject;

  /**
   * @type {EventBody}
   */
  body;

  /**
   * @type {EventDate}
   */
  start;

  /**
   * @type {EventDate}
   */
  end;

  /**
   * @type {{pattern: EventRecurrencePattern, range: EventRecurrenceRange}}
   */
  recurrence;
}

module.exports = { MsEvent };
