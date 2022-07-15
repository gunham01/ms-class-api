const dotenv = require("dotenv");
dotenv.config(); // Phải có dòng này để đọc được file .env

function getPort() {
  if (!process.env.API_PORT) {
    process.exit(1);
  }

  return parseInt(process.env.API_PORT);
}

module.exports = {
  getPort,
};
