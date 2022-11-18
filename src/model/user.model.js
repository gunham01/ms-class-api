class User {
  /**
   * @type {number}
   */
  id;

  /**
   * @type {string}
   */
  teacherId;

  /**
   * @type {string}
   */
  email;

  /**
   * @type {string}
   */
  password
  
  /**
   * @type {string}
   */
  msAccessToken;
  
  createdAt = new Date();
  updatedAt = new Date();

  /**
   * @public
   * @param {User} param0 
   */
  constructor({ teacherId, email, msAccessToken }) {
    this.teacherId = teacherId;
    this.email = email;
    this.msAccessToken = msAccessToken;
  }
}

module.exports = {
  User,
};
