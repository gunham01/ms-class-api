const { JwtController } = require("./jwt.controller");
const { TeacherWebScheduleController } = require("./teacher-web-schedule.controller");
const { UserController } = require("./user.controller");
const { MsteamsController } = require("./msteams.controller");

/**
 * Đảm bảo các controller chỉ được tạo 1 lần (singleton)
 */
class ControllerFactory {
  static _userController = new UserController();
  static _teacherWebScheduleController = new TeacherWebScheduleController();
  static _msteamsController = new MsteamsController();
  static _jwtController = new JwtController();

  static get userController() {
    return this._userController;
  }

  static get teacherWebScheduleController() {
    return this._teacherWebScheduleController;
  }

  static get jwtController() {
    return this._jwtController;
  }

  static get msteamsController() {
    return ControllerFactory._msteamsController;
  }
}

module.exports = {
  ControllerFactory
}