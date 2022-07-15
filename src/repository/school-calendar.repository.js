const { SchoolCalendar } = require("../model/school-calendar.model.js");
const { BaseRepository } = require("./base.repository.js");

class SchoolCalendarRepository extends BaseRepository {
  constructor() {
    super();
  }

  /**
   * @param {SchoolCalendar} schoolCalendar
   */
  insert(schoolCalendar) {
    return this.query(
      "INSERT INTO school_calendar (teacher_id, semester_id, ms_class_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      schoolCalendar.teacherId,
      schoolCalendar.semesterId,
      schoolCalendar.msClassId,
      new Date(),
      new Date()
    );
  }

  /**
   * @param {string} teacherId mã giảng viên
   * @param {string} semesterId mã học kỳ
   */
  getByTeacherIdAndSemesterId(teacherId, semesterId) {
    return this.query("SELECT * FROM school_calendar WHERE teacher_id = ?  AND semester_id = ?", teacherId, semesterId);
  }

  /**
   * @param {SchoolCalendar} schoolCalendar
   */
  updateById(schoolCalendar) {
    return this.query(
      "UPDATE school_calendar SET teacher_id = ?, semester_id = ?, ms_class_id = ?, updated_at = ? WHERE id = ?",
      schoolCalendar.teacherId,
      schoolCalendar.semesterId,
      schoolCalendar.msClassId,
      new Date(),
      schoolCalendar.id
    );
  }
}

module.exports = { SchoolCalendarRepository };
