const CRAWLER_CONFIG = {
  /**
   * Thời gian đợi giữa 2 lần thao tác khi cào web
   */
  waitTime: 1000,
};

/**
 * @param {number} waitTime
 */
function setWaitTime(waitTime) {
  CRAWLER_CONFIG.waitTime = waitTime;
}

module.exports = { CRAWLER_CONFIG, setWaitTime };
