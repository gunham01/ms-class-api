class MsOnlineMeeting {
  /**
   * @type {boolean}
   */
  allowAttendeeToEnableCamera;

  /**
   * @type {boolean}
   */
  allowAttendeeToEnableMic;

  /**
   * @type {'everyone' | 'organization' | 'roleIsPresenter' | 'organizer'}
   */
  allowedPresenters;

  /**
   * @type {'enabled' | 'disabled' | 'limited'}
   */
  allowMeetingChat;

  /**
   * @type {boolean}
   */
  allowTeamworkReactions;

  /**
   * @type {string}
   */
  subject;

  /**
   * @type {{attendees: any }}
   */
  participants;
}

module.exports = {
  MsOnlineMeeting,
};
