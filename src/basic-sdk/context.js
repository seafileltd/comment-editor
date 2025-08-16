import Url from 'url-parse';

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

  getPrintCss() {
    const server = this.getSetting('serviceUrl');
    const mediaUrl = this.getSetting('mediaUrl');
    // const commonCss = `${server}${mediaUrl}css/seafile-ui.css`;
    const fontCss = `${server}${mediaUrl}/sdoc-editor/sdoc-editor-font.css`;
    return [fontCss];
  }

  updateSettings(update) {
    for (let key in update) {
      this.settings[key] = update[key];
    }
  }

  getEditorConfig() {
    // When you need to execute this function, make sure to get the latest configuration items
    const { docUuid, accessToken, sdocServer } = this.getSettings();
    this.config = {
      docUuid,
      accessToken,
      sdocServer: (new Url(sdocServer)).origin,
      user: this.getUserInfo()
    };
    return this.config;
  }

  /**
   * @private Get DocUuid
   */
  getDocUuid() {
    return this.getSetting('docUuid');
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

  uploadLocalVideo = (videoFiles) => {
    const docUuid = this.getSetting('docUuid');
    return (
      this.api.uploadSdocVideo(docUuid, videoFiles).then((res) => {
        const { relative_path } = res.data;
        return relative_path;
      })
    );
  };

  getUserInfo() {
    return this.user;
  }

  // revision
  startRevise() {
    const repoID = this.getSetting('repoID');
    const filePath = this.getSetting('docPath');
    const fileUuid = this.getSetting('docUuid');
    return this.api.startRevise(repoID, fileUuid, filePath);
  }

  getSeadocOriginFileContent() {
    const docUuid = this.getSetting('docUuid');
    return this.api.getSeadocOriginFileContent(docUuid);
  }

  getSdocRevisionsCount() {
    const docUuid = this.getSetting('docUuid');
    return this.api.getSdocRevisionsCount(docUuid);
  }

  getSdocRevisions(page, perPage) {
    const docUuid = this.getSetting('docUuid');
    return this.api.getSdocRevisions(docUuid, page, perPage);
  }

  publishRevision() {
    const docUuid = this.getSetting('docUuid');
    return this.api.publishRevision(docUuid);
  }

  updateSdocRevision(sdocContent) {
    const docUuid = this.getSetting('docUuid');
    const docName = this.getSetting('docName');
    return this.api.updateSdocRevision(docUuid, docName, sdocContent);
  }

  deleteSdocRevision() {
    const docUuid = this.getSetting('docUuid');
    return this.api.deleteSdocRevision(docUuid);
  }

  deleteSdocOtherRevision(revisionId) {
    const docUuid = this.getSetting('docUuid');
    return this.api.deleteSdocOtherRevision(docUuid, revisionId);
  }

  getRevisionBaseVersionContent() {
    const docUuid = this.getSetting('docUuid');
    return this.api.getRevisionBaseVersionContent(docUuid);
  }

  getPublishedRevisionContent() {
    const docUuid = this.getSetting('docUuid');
    return this.api.getPublishedRevisionContent(docUuid);
  }

  // local files
  getSdocLocalFiles(p, type) {
    const docUuid = this.getSetting('docUuid');
    return this.api.getSdocFiles(docUuid, p, type);
  }

  getSdocLocalFileId(p) {
    const docUuid = this.getSetting('docUuid');
    return this.api.getSdocFileId(docUuid, p);
  }

  getSdocLocalFileUrl(docUuid) {
    const sdocServer = this.getSetting('serviceUrl');
    return sdocServer + '/api/v2.1/seadoc/file/' + docUuid + '/?doc_uuid=' + docUuid;
  }

  copyImage(originDocUuid, imageList) {
    const docUuid = this.getSetting('docUuid');
    return this.api.asyncCopyImages(docUuid, originDocUuid, imageList);
  }

  getLinkFilesInfo(filesUrl) {
    const docUuid = this.getSetting('docUuid');
    return this.api.getLinkFilesInfo(docUuid, filesUrl);
  }

  getCopyMoveProgressView(taskId) {
    const docUuid = this.getSetting('docUuid');
    return this.api.getCopyMoveProgressView(docUuid, taskId);
  }

  searchSdocFiles(query, page, per_page) {
    const docUuid = this.getSetting('docUuid');
    return this.api.searchSdocFiles(docUuid, query, page, per_page);
  }

  getSearchFilesByFilename(query, page, per_page, search_type){
    const docUuid = this.getSetting('docUuid');
    return this.api.searchFilesByFilename(docUuid, query, page, per_page, search_type);
  }

  // participants
  listParticipants() {
    const docUuid = this.getSetting('docUuid');
    return this.api.listParticipants(docUuid);
  }

  addParticipants(emails) {
    const docUuid = this.getSetting('docUuid');
    return this.api.addParticipants(docUuid, emails);
  }

  deleteParticipants(emails) {
    const docUuid = this.getSetting('docUuid');
    return this.api.deleteParticipants(docUuid, emails);
  }

  listRelatedUsers() {
    const docUuid = this.getSetting('docUuid');
    return this.api.listRelatedUsers(docUuid);
  }

  aiTranslate(text, lang) {
    const docUuid = this.getDocUuid();
    return this.api.aiTranslate(docUuid, text, lang);
  }

  writingAssistant(text, type, custom_prompt) {
    const docUuid = this.getDocUuid();
    return this.api.writingAssistant(docUuid, text, type, custom_prompt);
  }

  updateConfigUuid(docUuid) {
    if (!this.config) return;
    this.config['docUuid'] = docUuid;
  }

}

const context = new Context();

export default context;
