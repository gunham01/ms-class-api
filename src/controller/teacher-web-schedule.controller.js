const { SemesterProvider } = require("../crawler/semesters-provider");
const { TeacherScheduleProvider } = require("../crawler/teacher-schedule-provider");
const { HttpResponse, HttpStatus } = require("../model/http-response.model");
const { SchoolCalendar } = require("../model/school-calendar.model");
const { SchoolWebSchedule } = require("../model/school-web-schedule.model");
const { SchoolCalendarRepository } = require("../repository/school-calendar.repository");

class TeacherWebScheduleController {
  _schoolScheduleRepository = new SchoolCalendarRepository();

  async getSchedule(teacherId, semesterId) {
    if (!teacherId || !semesterId) {
      return HttpResponse.badRequest("Mã giảng viên và mã học kỳ đều không được để trống");
    }

    try {
      const teacherSchedule = await new TeacherScheduleProvider().getSchedule(teacherId, semesterId);
      await this.saveSchoolWebSchedule(teacherSchedule);
      return HttpResponse.ok(teacherSchedule);
    } catch (error) {
      console.log(error);
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Có lỗi xảy ra khi lấy lịch: " + error);
    }
  }

  /**
   *
   * @param {SchoolWebSchedule} schoolWebSchedule
   */
  saveSchoolWebSchedule(schoolWebSchedule) {
    return this._schoolScheduleRepository.insert(
      new SchoolCalendar({ teacherId: schoolWebSchedule.teacherId, semesterId: schoolWebSchedule.semesterId })
    );
  }

  async getAllSemesters() {
    try {
      const semesters = await new SemesterProvider().getSemesters();
      return HttpResponse.ok(semesters);
    } catch (error) {
      console.error("Lỗi khi lấy học kỳ.", error);
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Có lỗi xảy ra khi lấy học kỳ: " + error);
    }
  }
}

module.exports = {
  TeacherWebScheduleController,
};
