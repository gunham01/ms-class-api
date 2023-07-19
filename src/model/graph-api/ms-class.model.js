class MsClass {
  /**
   * @public
   * @param {{displayName: string, description: string}} param0
   */
  constructor({ displayName, description }) {
    this.displayName = displayName;
    this.description = description;

    // Old API
    this["template@odata.bind"] = "https://graph.microsoft.com/v1.0/teamsTemplates('educationClass')";
    // this.specialization = TEAM_SCPECIALIZATION.EDUCATION_PROFESSTIONAL_LEARNING_COMMUNITY;
    // this.visibility = TEAM_VISIBILITY.PRIVATE,
    this.guestSettings = {
      allowCreateUpdateChannels: false,
      allowDeleteChannels: false,
    };
    this.memberSettings = {
      allowCreatePrivateChannels: false,
      allowCreateUpdateChannels: false,
      allowDeleteChannels: false,
      allowAddRemoveApps: false,
      allowCreateUpdateRemoveTabs: false,
      allowCreateUpdateRemoveConnectors: false,
    };
    // Comment lại, vì mặc định là true hết
    // this.messagingSettings = {
    //   allowUserEditMessages: true,
    //   allowUserDeleteMessages: true,
    //   allowOwnerDeleteMessages: true,
    //   allowTeamMentions: true,
    //   allowChannelMentions: true,
    // };
  }
}

const TEAM_SCPECIALIZATION = Object.freeze({
  NONE: 0,
  EDUCATION_STANDARD: 'EducationStandard',
  EDUCATION_CLASS: 'EducationClass',
  EDUCATION_PROFESSTIONAL_LEARNING_COMMUNITY: 'educationProfessionalLearningCommunity',
  EDUCATION_STAFF: 'EducationStaff',
  UNKNOW_FUTURE_VALUE: 'UnknowFutureValue',
});

const TEAM_VISIBILITY = Object.freeze({
  PRIVATE: 'Private',
  PUBLIC: 'Public',
  HIDDEN_MEMBERSHIP: 'HiddenMembership', // Chỉ có admin mới nhìn thấy + join nhóm cần được admin duyệt/có quyền admin
})

module.exports = {
  MsClass,
};
