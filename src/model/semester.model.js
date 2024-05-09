class Semester {
  /**
   * @type {string}
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
   * @param {Required<Omit<Semester, 'isActive'>> & {isActive?: boolean}} param0
   */
  constructor({ id, name, startDate, isActive }) {
    this.id = id;
    this.name = name;
    this.startDate = startDate;
    this.isActive = isActive ?? false;
  }
}

module.exports = {
  Semester,
};
