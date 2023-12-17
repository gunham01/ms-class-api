const express = require('express');
const { ControllerFactory } = require('../controller/controller-factory');
const { RouterUtils } = require('./utils/router.utils');
const { UserRepository } = require('../repository/user.repository');

const userRouter = express.Router();
userRouter.post('/:id', updateTeacherId);

const userRepository = new UserRepository();

/**
 * @param {express.Request} request
 * @param {express.Response} response
 */
async function updateTeacherId(request, response) {
  const { userId, teacherId } = request.body;
  try {
    await userRepository.updateTeacherId(userId, teacherId);
    return response.sendStatus(200);
  } catch (error) {
    response.status(400).send(error);
  }
}

/**
 * @param {express.Request} request
 * @param {express.Response} response
 */
async function register(request, response) {
  const user = request.body;
  const serverRegisterResponse = await ControllerFactory.userController.insert(
    user
  );
  RouterUtils.response(response, serverRegisterResponse);
}

module.exports = {
  userRouter,
};
