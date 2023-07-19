const { ResponseType, HttpMethod: PrismaHttpMethod } = require('@prisma/client');
const { MsEvent } = require('../model/graph-api/ms-event.model');
const { UserRepository } = require('../repository/user.repository');
const { msGraphApiLogger } = require('./ms-graph-api.logger');

require('dotenv').config();
const axios = require('axios').default.create({
  baseURL: process.env.GRAPH_API_BASE_URL,
});
const userRepository = new UserRepository();

/**
 * @typedef {"GET" | "POST" | "PUT" | "DELETE"} HttpMethod
 * @param {string} token
 * @param {{method: HttpMethod}} method
 * @returns
 */
function generateCommonHeader(token, { method }) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

/**
 * @typedef {import('axios').AxiosRequestConfig} AxiosRequestConfig
 */

/**
 * @param {AxiosRequestConfig} axiosConfig
 * @param {{msToken: string}} param1
 */
async function callMsGraphApi(axiosConfig, { msToken }) {
  const user = await userRepository.getByMsToken(msToken);
  const request = {
    url: axiosConfig.url,
    body: axiosConfig.data ? JSON.stringify(axiosConfig.data) : null,
  };
  const method = PrismaHttpMethod[axiosConfig.method.toUpperCase()];

  try {
    const response = await axios(axiosConfig);
    await msGraphApiLogger.log({
      userId: user.id,
      method,
      request,
      response: {
        status: response.status,
        body: response.data ? JSON.stringify(response.data) : null,
      },
      type: ResponseType.SUCCESS,
    });

    return response;
  } catch (error) {
    if (error.isAxiosError) {
      await msGraphApiLogger.log({
        userId: user.id,
        method,
        request,
        response: {
          status: error.response.status,
          body: error.response.data?.error
            ? JSON.stringify(error.response.data.error)
            : JSON.stringify(error),
        },
        type: ResponseType.ERROR,
      });
    }

    throw error;
  }
}

module.exports = {
  /**
   * @param {string} token
   */
  getUserInfo: (token) => {
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosConfig = {
      headers: generateCommonHeader(token, { method: 'GET' }),
      method: 'get',
      url: '/me',
    };
    return callMsGraphApi(axiosConfig, { msToken: token });
  },

  /**
   * @param {string} token
   * @param {import("../model/graph-api/ms-class.model").MsClass} data
   */
  createClass: async (token, data) => {
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosRequestConfig = {
      headers: generateCommonHeader(token, { method: 'POST' }),
      method: 'post',
      url: '/teams',
      data: data,
    };
    return callMsGraphApi(axiosRequestConfig, { msToken: token });
  },

  /**
   * @param {string} token
   */
  getClassList: (token) => {
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosRequestConfig = {
      headers: generateCommonHeader(token, { method: 'GET' }),
      method: 'get',
      url: '/me/joinedTeams',
    };
    return callMsGraphApi(axiosRequestConfig, { msToken: token });
  },

  /**
   * @param {string} token
   * @param {any} memberEmails
   * @param {string} id
   */
  addMember: (token, memberEmails, id) => {
    const membersPayload = memberEmails.map((email) => ({
      '@odata.type': 'microsoft.graph.aadUserConversationMember',
      roles: ['member'],
      'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${email}')`,
    }));

    /**
     * @type {AxiosRequestConfig}
     */
    const axiosRequestConfig = {
      headers: generateCommonHeader(token, { method: 'POST' }),
      method: 'post',
      url: `/teams/${id}/members/add`,
      data: {
        values: membersPayload,
      },
    };

    return callMsGraphApi(axiosRequestConfig, { msToken: token });
  },

  /**
   *
   * @param {string} url
   * @param {string} token
   * @returns
   */
  pingCreateClassAsycnOperation: (url, token) => {
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosRequestConfig = {
      headers: generateCommonHeader(token, { method: 'GET' }),
      method: 'get',
      url,
    };

    return callMsGraphApi(axiosRequestConfig, { msToken: token });
  },

  /**
   * @param {string} token
   * @param {{ event: MsEvent }} param0
   */
  async createEvent(token, { event }) {
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosRequestConfig = {
      headers: generateCommonHeader(token, { method: 'POST' }),
      method: 'post',
      url: `/me/events`,
      data: event,
    };

    const response = await callMsGraphApi(axiosRequestConfig, {
      msToken: token,
    });
    return response.data;
  },

  /**
   *
   * @param {string} token
   * @param {{
   *  teamId: string,
   *  channel: { displayName: string, description: string }
   * }} param1
   * @returns
   */
  createChannel(token, { teamId, channel }) {
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosRequestConfig = {
      headers: generateCommonHeader(token, { method: 'POST' }),
      method: 'post',
      url: `/teams/${teamId}/channels`,
      data: channel,
    };

    return callMsGraphApi(axiosRequestConfig, { msToken: token });
  },

  /**
   *
   * @param {string} token
   * @param {{
   *  teamId: string
   *  subject: string
   *  channelId: string
   *  chatContentInHtml: string
   * }} param1
   * @returns
   */
  chatToChannel(token, { teamId, channelId, subject, chatContentInHtml }) {
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosRequestConfig = {
      headers: generateCommonHeader(token, { method: 'POST' }),
      method: 'post',
      url: `/teams/${teamId}/channels/${channelId}/messages`,
      data: {
        subject,
        body: {
          contentType: 'html',
          content: chatContentInHtml,
        },
      },
    };

    return callMsGraphApi(axiosRequestConfig, { msToken: token });
  },

  getAllTeamEvent(token, { teamId, size, page }) {
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosRequestConfig = {
      headers: generateCommonHeader(token, { method: 'GET' }),
      method: 'get',
      url: `/groups/${teamId}/events/?$select=id,attendees&top=${size}&skip=${
        (page - 1) * size
      }`,
    };
    return callMsGraphApi(axiosRequestConfig, { msToken: token });
  },

  cancelEvent(token, { teamId, eventId }) {
    /**
     * @type {AxiosRequestConfig}
     */
    const axiosRequestConfig = {
      headers: generateCommonHeader(token, { method: 'POST' }),
      method: 'post',
      url: `/groups/${teamId}/events/${eventId}/cancel`,
    };

    return callMsGraphApi(axiosRequestConfig, { msToken: token });
  },
};
