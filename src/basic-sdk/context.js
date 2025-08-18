class Context {

  constructor() {
    this.settings = null;
    this.api = null;
    this.config = null;
  }

  initSettings = (settings) => {
    this.settings = settings ? settings : (window.seafile ? window.seafile : window.seafileConfig);
    const { name = '', username = '', avatarURL = '' } = this.settings;
    const userInfo = { name, username, avatar_url: avatarURL };
    this.user = userInfo;
  };

  init(settings, api) {
    this.initSettings(settings);
    this.api = api;
  }

  getSettings() {
    return this.settings;
  }

  getSetting(key) {
    if (this.settings[key] === false) return this.settings[key];
    return this.settings[key] || '';
  }

  updateSettings(update) {
    for (let key in update) {
      this.settings[key] = update[key];
    }
  }

  uploadLocalImage = (imageFiles) => {
    const docUuid = this.getSetting('docUuid');
    return (
      this.api.uploadSdocImage(docUuid, imageFiles).then((res) => {
        const { relative_path } = res.data;
        return relative_path;
      })
    );
  };

  getUserInfo() {
    return this.user;
  }

  copyImage(originDocUuid, imageList) {
    const docUuid = this.getSetting('docUuid');
    return this.api.asyncCopyImages(docUuid, originDocUuid, imageList);
  }

  getCopyMoveProgressView(taskId) {
    const docUuid = this.getSetting('docUuid');
    return this.api.getCopyMoveProgressView(docUuid, taskId);
  }

  addParticipants(emails) {
    const docUuid = this.getSetting('docUuid');
    return this.api.addParticipants(docUuid, emails);
  }

  getFileUrlByUuid = (docUuid) => {
    const sdocServer = this.getSetting('serviceUrl');
    return sdocServer + '/api/v2.1/seadoc/file/' + docUuid + '/?doc_uuid=' + docUuid;
  };

}

const context = new Context();

export default context;
