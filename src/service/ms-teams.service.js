const { SchoolWebEvent } = require("../model/school-web-event.model");
const { Semester } = require("../model/semester.model");

class MsTeamsService {
  /**
   * @public
   * @param {SchoolWebEvent} schoolWebEvent
   * @param {Semester} semester
   */
  static schoolWebEventToMsTeamsClass(schoolWebEvent, semester) {
    return new MsTeamsClass({
      id: "",
      displayName: "",
      description: "",
    });
  }

  /**
   * @private
   * @param {SchoolWebEvent} schoolWebEvent
   * @param {Semester} semester
   */
  static generateMsTeamsClassDisplayName(schoolWebEvent, semester) {
    const semesterInfo = this.preprocessSemesterInfo(semester);
    return `${schoolWebEvent.subjectGroup}_${schoolWebEvent.subjectId}_${schoolWebEvent.subjectName}_`;
  }

  /**
   * @private
   * @param {Semester} semester
   */
  static preprocessSemesterInfo(semester) {
    const startYear = semester.startDate.getFullYear();
    const startYearLastTwoDigit = startYear % 100;
    const endYearLastTwoDigit = startYearLastTwoDigit + 1;
    const index = Number(semester.name.match(/\b\d\b/)[0]);
    return {
      index: index,
      startYear: startYearLastTwoDigit,
      endYear: endYearLastTwoDigit,
    };
  }
}
