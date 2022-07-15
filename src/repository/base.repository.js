const { MySQLUtils } = require("../utils/mysql.utils.js");
require("dotenv").config({ path: "../.env" });

class BaseRepository {
  constructor() {}

  createConnection() {
    console.log("process.env.DB_HOST:", process.env.DB_HOST);
    return MySQLUtils.createConnection({
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
  }

  /**
   * Kết nối tới database
   * @returns đối tượng kết nối tới database
   */
  async connectToDatabase() {
    this._mysqlConnection = this.createConnection();
    return new Promise((resolve, reject) => {
      this._mysqlConnection.connect((error) => {
        if (error) {
          console.error("Lỗi khi kết nối database. ", error);
          reject(error);
        }

        resolve(undefined);
      });
    });
  }

  /**
   * Thực hiện truy vấn SQL
   * @param {string} queryString câu lệnh SQL
   * @param {any[]} args các tham số
   */
  async query(queryString, ...args) {
    await this.connectToDatabase();
    return new Promise((resolve, reject) => {
      this._mysqlConnection.query(queryString, args ? [...args] : [], (error, result) => {
        this._mysqlConnection.end();
        error ? reject(error) : resolve(result);
      });
    });
  }
}

module.exports = { BaseRepository };
