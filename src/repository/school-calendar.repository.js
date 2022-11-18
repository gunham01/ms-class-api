const { SchoolCalendar } = require("../model/school-calendar.model.js");
const { BaseRepository } = require("./base.repository.js");

class SchoolCalendarRepository extends BaseRepository {
  constructor() {
    super();
  }

  /**
   * @public
   * @param {SchoolCalendar} schoolCalendar
   */
  insert(schoolCalendar) {
    return this.query(
      "INSERT INTO school_calendar (teacher_id, semester_id, created_at, updated_at) VALUES (?, ?, ?, ?)",
      schoolCalendar.teacherId,
      schoolCalendar.semesterId,
      new Date(),
      new Date()
    );
  }

  /**
   * @public
   * @param {string} teacherId mã giảng viên
   * @param {string} semesterId mã học kỳ
   */
  getByTeacherIdAndSemesterId(teacherId, semesterId) {
    return this.query("SELECT * FROM school_calendar WHERE teacher_id = ?  AND semester_id = ?", teacherId, semesterId);
  }

  /**
   * @public
   * @param {string} teacherId 
   * @param {string} semesterId 
   * @returns {Promise<boolean>}
   */
  async existsByTeacherIdAndSemesterId(teacherId, semesterId) {
    const existedModel = await this.getByTeacherIdAndSemesterId(teacherId, semesterId);
    console.log(existedModel);
    return existedModel.length > 0;
  }

  /**
   * @pubic
   * @param {SchoolCalendar} schoolCalendar
   */
  updateById(schoolCalendar) {
    return this.query(
      "UPDATE school_calendar SET teacher_id = ?, semester_id = ?, ms_class_id = ?, updated_at = ? WHERE id = ?",
      schoolCalendar.teacherId,
      schoolCalendar.semesterId,
      new Date(),
      schoolCalendar.id
    );
  }
}

module.exports = { SchoolCalendarRepository };
