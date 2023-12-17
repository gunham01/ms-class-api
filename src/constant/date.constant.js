class HourMinute {
  /**
   * @type {number}
   */
  hour;

  /**
   * @type {number}
   */
  minute;

  /**
   *
   * @param {{hour: number, minute?: number}} initValue
   */
  constructor({ hour, minute }) {
    this.hour = hour;
    this.minute = minute ?? 0;
  }

  toString() {
    return `${this.hour}:${this.minute}`;
  }
}

module.exports = Object.freeze({
  DAY_OF_WEEKS: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],
  SCHOOL_PERIOD: {
    1: {
      start: new HourMinute({ hour: 7, minute: 0 }),
      end: new HourMinute({ hour: 7, minute: 50 }),
    },
    2: {
      start: new HourMinute({ hour: 7, minute: 55 }),
      end: new HourMinute({ hour: 8, minute: 45 }),
    },
    3: {
      start: new HourMinute({ hour: 8, minute: 50 }),
      end: new HourMinute({ hour: 9, minute: 40 }),
    },
    4: {
      start: new HourMinute({ hour: 9, minute: 55 }),
      end: new HourMinute({ hour: 10, minute: 45 }),
    },
    5: {
      start: new HourMinute({ hour: 10, minute: 50 }),
      end: new HourMinute({ hour: 11, minute: 40 }),
    },

    6: {
      start: new HourMinute({ hour: 12, minute: 45 }),
      end: new HourMinute({ hour: 13, minute: 35 }),
    },
    7: {
      start: new HourMinute({ hour: 13, minute: 40 }),
      end: new HourMinute({ hour: 14, minute: 30 }),
    },
    8: {
      start: new HourMinute({ hour: 14, minute: 35 }),
      end: new HourMinute({ hour: 15, minute: 25 }),
    },
    9: {
      start: new HourMinute({ hour: 15, minute: 40 }),
      end: new HourMinute({ hour: 16, minute: 30 }),
    },
    10: {
      start: new HourMinute({ hour: 16, minute: 35 }),
      end: new HourMinute({ hour: 17, minute: 25 }),
    },
  },
});
