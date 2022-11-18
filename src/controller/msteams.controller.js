const { HttpResponse, HttpStatus } = require("../model/http-response.model");
const api = require("../ms_graph_api/index");
const _ = require("lodash");
const { UserRepository } = require("../repository/user.repository");
const axios = require("axios");
const { MsClass } = require("../model/graph-api/ms-class.model");

/**
 * @typedef {import("../model/student.model").Student} Student
 * @typedef {import("express").Request} Request
 * @typedef {import("express").Response} Response
 */

class MsteamsController {
  _userRepository = new UserRepository();

  /**
   * @public
   * @param {Request} req
   * @returns {Promise<HttpResponse>}
   */
  async signIn(req) {
    const params = {
      scopes: process.env.OAUTH_SCOPES.split(","),
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    };

    try {
      const authUrl = await req.app.locals.msalClient.getAuthCodeUrl(params);
      return HttpResponse.status(HttpStatus.OK).body(authUrl);
    } catch (error) {
      console.log("Lỗi khi đăng nhập MS Teasm: ", error);
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(`Error: ${error}`);
    }
  }

  /**
   * @public
   * @param {Request} req
   * @param {Response} res
   */
  async callBack(req, res) {
    const tokenRequest = {
      code: req.query.code,
      scopes: process.env.OAUTH_SCOPES.split(","),
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    };

    try {
      const response = await req.app.locals.msalClient.acquireTokenByCode(tokenRequest);
      // res.status(200).json(response);
      res.redirect(`${process.env.USER_UI_URL}?code=${response.accessToken}&email=${response.account.username}`);
    } catch (error) {
      console.log("Lỗi trong hàm callback: ", error);
      // res.status(500).json({ error: error });
      res.redirect(`${process.env.USER_UI_URL}?error=true`);
    }
  }

  /**
   * @public
   * @param {string} token
   * @param {string} displayName
   * @param {string} description
   */
  createClass(token, displayName, description) {
    const payloadClass = new MsClass({ displayName: displayName, description: description });
    console.log(payloadClass);
    return api.createClass(token, payloadClass);
  }

  /**
   * @public
   * @param {string} token
   * @param {string} className
   */
  async getClassId(token, className) {
    try {
      const response = await api.getListClass(token);
      let classInfo = _.find(response.data.value, ["displayName", className]);
      return classInfo ? classInfo.id : null;
    } catch (error) {
      console.log(`Lỗi khi lấy class với tên ${className}: `, error);
      return false;
    }
  }

  /**
   *
   * @param {string} token
   * @param {string} classId
   * @param {Student[]} users
   * @returns
   */
  async addMember(token, classId, users) {
    try {
      let listMember = [];

      users.forEach((user) => {
        listMember.push({
          "@odata.type": "microsoft.graph.aadUserConversationMember",
          roles: ["member"],
          "user@odata.bind": "https://graph.microsoft.com/v1.0/users('" + user + "')",
        });
      });

      let payloadMember = {
        values: listMember,
      };
      await api.addMember(token, payloadMember, classId);

      return true;
    } catch (error) {
      console.log(`Lỗi khi thêm sinh viên với lớp có ID ${classId}: `, error);
      return false;
    }
  }

  /**
   * @public
   * @param {Request} req
   * @returns
   */
  async createClasses(req) {
    try {
      const { token, data } = req.body;
      for (const _class of data) {
        // Kiểm tra xem lớp đã tồn tại hay chưa
        let classId = await this.getClassId(token, _class.displayName);
        if (classId) {
          return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(`Nhóm lớp đã tồn tại`);
        }

        let createClassAsyncOperationResponse = await this.createClass(token, _class.displayName, _class.description);
        const asyncOperationResponseUrl = `https://graph.microsoft.com/v1.0${createClassAsyncOperationResponse.headers.location}`;
        classId = await this.pingUntilGetClassId(asyncOperationResponseUrl, token);
        // console.log(classId);
        const addMemberResponse = await this.addMember(token, classId, _class.users);
        if (addMemberResponse) {
          console.log("addMemberReponse: ", addMemberResponse);
        }
      }

      return HttpResponse.status(HttpStatus.OK).body("Thành công");
    } catch (error) {
      console.log("Lỗi khi tạo các lớp học: ", error.response.data.error);
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(`Error: ${error}`);
    }
  }

  /**
   * @param {number} ms
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * @param {string} asyncOperationUrl
   * @param {string} accessToken
   * @returns {Promise<string>} id của class vừa được tạo
   */
  async pingUntilGetClassId(asyncOperationUrl, accessToken) {
    while (true) {
      const asyncOperationResponse = await axios.get(asyncOperationUrl, {
        headers: {
          Authorization: accessToken,
        },
      });

      if (asyncOperationResponse.data.status === "succeeded") {
        return asyncOperationResponse.data.targetResourceId;
      } else {
        await this.delay(7000);
      }
    }
  }
}

module.exports = {
  MsteamsController,
};
