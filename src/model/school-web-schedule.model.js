class SchoolWebSchedule {
  teacherId;
  semesterId;
  events;
  scheduleHash;

  constructor({ teacherId, semesterId, events, scheduleHash }) {
    this.teacherId = teacherId;
    this.semesterId = semesterId;
    this.events = events;
    this.scheduleHash = scheduleHash;
  }
}

module.exports = {
  SchoolWebSchedule,
};
