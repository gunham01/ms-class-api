const { ControllerFactory } = require('../controller/controller-factory');
const { RouterUtils } = require('./utils/router.utils');
require('dotenv').config();

const express = require('express');
const clientConstant = require('../constant/client.constant');
const router = express.Router();

router.get(
  '/signin',
  RouterUtils.verifyJwtExisted,
  RouterUtils.authenticateAccessToken,
  signIn
);
router.get('/callback', callBack);
router.post(
  '/main',
  RouterUtils.verifyJwtExisted,
  RouterUtils.authenticateAccessToken,
  main
);
router.post('/me', getProfile);
router.post('/cancel-all-team-events', cancelAllEventOfGroup);

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function signIn(req, res) {
  clientConstant.setClientUrl(req.headers.origin);
  const serverSignInResponse = await ControllerFactory.msteamsController.signIn(
    req
  );
  RouterUtils.response(res, serverSignInResponse);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function callBack(req, res) {
  await ControllerFactory.msteamsController.callBack(req, res);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function main(req, res) {
  const serverSignInResponse =
    await ControllerFactory.msteamsController.createClasses(req);
  RouterUtils.response(res, serverSignInResponse);
}

async function getProfile(req, res) {
  const serverResponse = await ControllerFactory.msteamsController.getProfile(
    req
  );
  RouterUtils.response(res, serverResponse);
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function cancelAllEventOfGroup(req, res) {
  const response =
    await ControllerFactory.msteamsController.cancelAllClassEvents(req);
  RouterUtils.response(res, response);
}

module.exports = router;
