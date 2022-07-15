const { ControllerFactory } = require("../controller/controller-factory");
const { RouterUtils } = require("./utils/router.utils");
require("dotenv").config();

const express = require("express");
const router = express.Router();

router.get("/signin", RouterUtils.authenticateAccessToken, signIn);
router.get("/callback", callBack);
router.post("/main", RouterUtils.authenticateAccessToken, main);

async function signIn(req, res) {
  const serverSignInResponse = await ControllerFactory.msteamsController.signIn(req);
  RouterUtils.response(res, serverSignInResponse);
}

async function callBack(req, res) {
  await ControllerFactory.msteamsController.callBack(req, res);
}

async function main(req, res) {
  const serverSignInResponse = await ControllerFactory.msteamsController.createClasses(req);
  RouterUtils.response(res, serverSignInResponse);
}

module.exports = router;
