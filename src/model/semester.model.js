class Semester {
  id;
  name;
  startDate;
  isActive;

  constructor({ id, name, startDate, isActive }) {
    this.id = id;
    this.name = name;
    this.startDate = startDate;
    this.isActive = !!isActive;
  }
}

module.exports = {
  Semester,
};
