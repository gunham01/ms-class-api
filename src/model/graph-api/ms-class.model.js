class MsClass {
  /**
   * @public
   * @param {{displayName: string, description: string}} param0 
   */
  constructor({ displayName, description }) {
    this.displayName = displayName;
    this.description = description;
    this["template@odata.bind"] = "https://graph.microsoft.com/v1.0/teamsTemplates('educationClass')";
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

module.exports = {
  MsClass,
};
