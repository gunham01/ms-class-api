let clientUrl;

module.exports = {
  /**
   * 
   * @param {string} baseUrl 
   */
  setClientUrl(baseUrl) {
    clientUrl = baseUrl + '/vnuaClassesTab'
  },

  /**
   * @returns {string}
   */
  getClientUrl() {
    return clientUrl;
  }
}