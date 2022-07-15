class SchoolCalendar {
  id;
  teacherId;
  semesterId;
  createdAt = new Date();
  updatedAt = new Date();
  msClassId;

  constructor({ teacherId, semesterId, createdAt, msClassId}) {
    this.teacherId = teacherId;
    this.semesterId = semesterId;
    this.createdAt = createdAt ? createdAt : new Date();
    this.msClassId = msClassId;
  }
}

module.exports = {
  SchoolCalendar,
};
