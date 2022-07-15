class User {
  id;
  teacherId;
  email;
  password
  msAccessToken;
  createdAt = new Date();
  updatedAt = new Date();

  constructor({ teacherIdks, email, msAccessToken }) {
    this.teacherId = teacherId;
    this.email = email;
    this.msAccessToken = msAccessToken;
  }
}

module.exports = {
  User,
};
