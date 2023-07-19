class MsTeamsClass {
  /**
   * @type {string}
   */
  id;

  /**
   * @type {string}
   */
  displayName;

  /**
   * @type {string}
   */
  description;

  constructor({ id, displayName, description }) {
    this.id = id;
    this.displayName = displayName;
    this.description = description;
  }
}
