const fs = require('fs');

class FileIOUtils {
  /**
   * Đọc file
   * @param {string} fileLocation nơi để file
   * @returns nội dung của file
   */
  static readFile(fileLocation) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileLocation, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    });
  }
}

module.exports = {
  FileIOUtils,
};
