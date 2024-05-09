const { JwtController } = require('./jwt.controller');
const {
  TeacherWebScheduleController,
} = require('./teacher-web-schedule.controller');
const { UserController } = require('./user.controller');
const { MsteamsController } = require('./msteams.controller');

/**
 * Đảm bảo các controller chỉ được tạo 1 lần (singleton)
 */
class ControllerFactory {
  /**
   * @private
   * @type {UserController}
   */
  static _userController = new UserController();

  /**
   * @private
   * @type {TeacherWebScheduleController}
   */
  static _teacherWebScheduleController = new TeacherWebScheduleController();

  /**
   * @private
   * @type {MsteamsController}
   */
  static _msteamsController = new MsteamsController();

  /**
   * @private
   * @type {JwtController}
   */
  static _jwtController = new JwtController();

  /**
   * @public
   */
  static get userController() {
    return this._userController;
  }

  /**
   * @public
   */
  static get teacherWebScheduleController() {
    return this._teacherWebScheduleController;
  }

  /**
   * @public
   */
  static get jwtController() {
    return this._jwtController;
  }

  /**
   * @public
   */
  static get msteamsController() {
    return ControllerFactory._msteamsController;
  }
}

module.exports = {
  ControllerFactory,
};
