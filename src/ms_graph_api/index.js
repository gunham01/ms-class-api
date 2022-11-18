require("dotenv").config();
const baseUrl = process.env.GRAPH_API_BASE_URL;

const axios = require("axios").default.create({
  baseURL: baseUrl,
});

/**
 * @typedef {"get" | "post" | "put" | "delete"} HttpMethod
 * @param {string} token
 * @param {HttpMethod} method
 * @returns
 */
function generateCommonHeader(token, method) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (method === "post") {
    headers.post = {
      "Content-Type": "application/json",
    };
  }

  return headers;
}

module.exports = {
  /**
   * @param {string} token
   */
  getUserInfo: (token) => {
    return axios({
      ...generateCommonHeader(token, "get"),
      method: "get",
      url: "/me",
    });
  },

  /**
   * @param {string} token
   * @param {import("../model/graph-api/ms-class.model").MsClass} data
   */
  createClass: (token, data) => {
    return axios({
      ...generateCommonHeader(token, "post"),
      method: "post",
      url: "/teams",
      data: data,
    });
  },

  /**
   * @param {string} token
   */
  getListClass: (token) => {
    return axios({
      ...generateCommonHeader(token, "get"),
      method: "get",
      url: "/me/joinedTeams",
    });
  },

  /**
   * @param {string} token
   * @param {any} data
   * @param {string} id
   */
  addMember: (token, data, id) => {
    return axios({
      ...generateCommonHeader(token, "post"),
      method: "post",
      url: `/teams/${id}/members/add`,
      data: data,
    });
  },
};
