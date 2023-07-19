const express = require('express');
const { ControllerFactory } = require('../controller/controller-factory');
const { HttpStatus } = require('../utils/http.utils');
const {
  VNUARequestValidator,
} = require('./request-validator/vnua.request-validator');
const { RouterUtils } = require('./utils/router.utils');

const requestValidator = new VNUARequestValidator();

const vnuaRouter = express.Router();
vnuaRouter.use(
  RouterUtils.verifyJwtExisted,
  RouterUtils.authenticateAccessToken
);
vnuaRouter.get('/semesters', getSemesters);
vnuaRouter.post(
  '/schedule',
  requestValidator.teachingScheduleRequestValidator,
  RouterUtils.respondWithRequestValidationErrorIfAny,
  getTeacherSchedule
);

/**
 * @param {express.Request} request
 * @param {express.Response} response
 */
async function getSemesters(request, response) {
  try {
    const serverSemesterResponse =
      await ControllerFactory.teacherWebScheduleController.getAllSemesters();
    RouterUtils.response(response, serverSemesterResponse);
  } catch (error) {
    console.log(`Lỗi khi lấy học kỳ: ${error}`);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send(`Lỗi khi lấy học kỳ: ${error}`);
  }
}

/**
 * @param {express.Request} request
 * @param {express.Response} response
 */
async function getTeacherSchedule(request, response) {
  const { teacherId, semesterId } = request.body;
  try {
    const serverTeacherScheduleResponse =
      await ControllerFactory.teacherWebScheduleController.getSchedule(
        teacherId,
        semesterId
      );
    RouterUtils.response(response, serverTeacherScheduleResponse);
  } catch (error) {
    console.log(`Lỗi khi lấy lịch từ đào tạo: ${error}`);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send(`Lỗi khi lấy lịch từ đào tạo: ${error}`);
  }
}

module.exports = {
  vnuaRouter,
};
