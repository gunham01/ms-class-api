const mysql = require("mysql");

class MySQLUtils {
  /**
   * Tao đối tượng kết nối tới MySQL
   * @param {mysql.ConnectionConfig} config các thiết lập
   * @returns đỐi tượng kết nối tới MySQL
   */
  static createConnection(config) {
    return mysql.createConnection(config);
  }
}

module.exports = {
  MySQLUtils,
};
