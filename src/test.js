const { SemesterProvider } = require("./crawler/semesters-provider");
require("dotenv").config();

(async function main() {
  getSchoolSemesters();
  getSchoolSemesters();
  getSchoolSemesters();
})();

async function getSchoolSemesters() {
  try {
    const semesters = await new SemesterProvider().getSemesters();
    console.log("semesters: ", semesters);
  } catch (error) {
    // console.error(error);
  }
}
