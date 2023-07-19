const { SemesterProvider } = require('../crawler/semesters-provider');
const {
  TeacherScheduleProvider,
} = require('../crawler/teacher-schedule-provider');
const { HttpResponse, HttpStatus } = require('../model/http-response.model');
const { Logger } = require('../utils/logger.utils');

class TeacherWebScheduleController {
  /**
   * @public
   * @param {string} teacherId
   * @param {string} semesterId
   * @returns {Promise<HttpResponse>}
   */
  async getSchedule(teacherId, semesterId) {
    try {
      const teacherSchedule = await new TeacherScheduleProvider().getSchedule(
        teacherId,
        semesterId
      );
      // await this.saveSchoolWebSchedule(teacherSchedule);
      return HttpResponse.ok(teacherSchedule);
    } catch (error) {
      Logger.logError(error, { message: 'Lỗi khi lấy lịch từ đào tạo' })
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
        'Có lỗi xảy ra khi lấy lịch: ' + error
      );
    }
  }

  /**
   * @public
   * @returns {Promise<HttpResponse>}
   */
  async getAllSemesters() {
    try {
      const semesters = await new SemesterProvider().getSemesters();
      return HttpResponse.ok(semesters);
    } catch (error) {
      console.error('Lỗi khi lấy học kỳ.', error);
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
        'Có lỗi xảy ra khi lấy học kỳ: ' + error
      );
    }
  }
}

module.exports = {
  TeacherWebScheduleController,
};
