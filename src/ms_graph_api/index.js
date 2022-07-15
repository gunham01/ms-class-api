require("dotenv").config();
const baseUrl = process.env.GRAPH_API_BASE_URL;

const axios = require("axios").create({
  baseURL: baseUrl,
});

function generateCommonHeader(token) {
  return {
    headers: {
      post: {
        "Content-Type": "application/json",
      },
      Authorization: `Bearer ${token}`,
    },
  };
}

module.exports = {
  getUserInfo: (token) => {
    return axios({
      ...generateCommonHeader(token),
      method: "get",
      url: "/me",
    });
  },
  createClass: (token, data) => {
    return axios({
      ...generateCommonHeader(token),
      method: "post",
      url: "/teams",
      data: data,
    });
  },
  getListClass: (token) => {
    return axios({
      ...generateCommonHeader(token),
      method: "get",
      url: "/me/joinedTeams",
    });
  },
  addMember: (token, data, id) => {
    return axios({
      ...generateCommonHeader(token),
      method: "post",
      url: `/teams/${id}/members/add`,
      data: data,
    });
  },
};
