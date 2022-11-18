class Semester {
  /**
   * @type {number}
   */
  id;

  /**
   * @type {string}
   */
  name;

  /**
   * @type {Date}
   */
  startDate;

  /**
   * @type {boolean}
   */
  isActive;

  /**
   *
   * @param {Semester} param0
   */
  constructor({ id, name, startDate, isActive = false }) {
    this.id = id;
    this.name = name;
    this.startDate = startDate;
    this.isActive = isActive;
  }
}

module.exports = {
  Semester,
};
