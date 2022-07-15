const { HttpResponse, HttpStatus } = require("../model/http-response.model");
const api = require("../ms_graph_api");
const _ = require("lodash");
const { UserRepository } = require("../repository/user.repository");

class MsteamsController {
  _userRepository = new UserRepository();

  async signIn(req) {
    const params = {
      scopes: process.env.OAUTH_SCOPES.split(","),
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    };

    try {
      const authUrl = await req.app.locals.msalClient.getAuthCodeUrl(params);
      return HttpResponse.status(HttpStatus.OK).body(authUrl);
    } catch (error) {
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(`Error: ${error}`);
    }
  }

  async callBack(req, res) {
    const tokenRequest = {
      code: req.query.code,
      scopes: process.env.OAUTH_SCOPES.split(","),
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    };

    try {
      const response = await req.app.locals.msalClient.acquireTokenByCode(tokenRequest);
      res.redirect(`${process.env.USER_UI_URL}?code=${response.accessToken}&email=${response.account.username}`);
    } catch (error) {
      console.log("Lỗi khi call back signin: ", error);
      res.redirect(`${process.env.USER_UI_URL}?error=true`);
    }
  }

  async createClass(token, displayName, description) {
    try {
      let payloadClass = {
        "template@odata.bind": "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
        displayName: displayName,
        description: description,
      }

      await api.createClass(token, payloadClass);
      return true;
    } catch (error) {
      console.log(`Lỗi khi tạo lớp với tên ${displayName} và mô tả ${description}: `, error);
      return false;
    }
  }

  async getClassId(token, className) {
    try {
      const response = await api.getListClass(token);
      let classInfo = _.find(response.data.value, ["displayName", className]);
      return classInfo.id;
    } catch (error) {
      console.log(`Lỗi khi lấy ID của lớp ${className}: `, error);
      return false;
    }
  }

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
      console.log(`Lỗi khi thêm sinh viên lớp với ID ${classId}: `, error);
      return false;
    }
  }

  async createClasses(req) {
    try {
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const { token, data } = req.body;

      for (const _class of data) {
        // Kiểm tra xem lớp đã tồn tại hay chưa
        let classId = await this.getClassId(token, _class.displayName);
        if (classId) {
          return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(`Nhóm lớp đã tồn tại`);
        }

        let classIsCreated = await this.createClass(token, _class.displayName, _class.description);
        if (!classIsCreated) {
          return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(`Tạo nhóm lớp thất bại`);
        }

        await delay(1000);
        classId = await this.getClassId(token, _class.displayName);
        if (!classId) continue;

        await this.addMember(token, classId, _class.users);
      }

      return HttpResponse.status(HttpStatus.OK).body("Thành công");
    } catch (error) {
      return HttpResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).body(`Error: ${error}`);
    }
  }
}

module.exports = {
  MsteamsController,
};
