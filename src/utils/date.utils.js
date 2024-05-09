const moment = require('moment');

class DateUtils {
  /**
   * Lấy ra ngày từ trong strinh
   * @param {string} str string chứa ngày cần lấy
   * @param {string} dateFormat định dạng của ngày cần lấy
   * @returns
   */
  static extractDateFromString(str, dateFormat) {
    const dateFormatRegEx = dateFormat
      .replace(/dd|mm/gi, '\\d{1,2}')
      .replace(/yyyy/gi, '\\d{4}');
    const dateStrs = str.match(dateFormatRegEx);
    if (!dateStrs) {
      return null;
    }

    const dateStr = dateStrs[0];
    return moment(dateStr, dateFormat).toDate();
  }
}

module.exports = DateUtils;
