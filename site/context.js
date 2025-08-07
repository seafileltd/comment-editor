import axios from 'axios';
import { SeafileAPI } from 'seafile-js';
import SDocServerApi from './api/sdoc-server-api';
import { getDirPath } from './utils';

class Context {

  constructor() {
    this.settings = window.seafile ? window.seafile : window.seafileConfig;
    this.api = null;
  }

  async initApi() {
    let seafileAPI = new SeafileAPI();
    const server = this.getSetting('serviceUrl');
    const username = this.getSetting('username');
    const password = this.getSetting('password');
    seafileAPI.init({ server, username, password });
    this.api = seafileAPI;
    await seafileAPI.login();
    const token = this.api.token;

    const isWiki = this.getSetting('isWiki');
    if (!isWiki) {
      const res = await this.getAccessToken(token);
      const { access_token } = res.data;
      this.settings = {
        ...this.settings,
        accessToken: access_token,
      };
    }

    this.sdocServerApi = new SDocServerApi(this.settings);
  }

  getSettings() {
    return this.settings;
  }

  getSetting(key) {
    if (this.settings[key] === false) return this.settings[key];
    return this.settings[key] || '';
  }

  getAccessToken = (token) => {
    const repoID = this.getSetting('repoID');
    const docUuid = this.getSetting('docUuid');
    const sourceID = repoID ? repoID : docUuid;

    const server = this.getSetting('serviceUrl');
    const docPath = this.getSetting('docPath');
    let url = `/api/v2.1/seadoc/access-token/${sourceID}/`;
    if (repoID) {
      url += `?p=${docPath}`;
    }

    return axios.get(url, {
      baseURL: server,
      headers: { Authorization: `Token ${token}` }
    });
  };

  getFileContent() {
    const isOpenSocket = this.getSetting('isOpenSocket');
    if (isOpenSocket) {
      return this.getFileContent1();
    }

    return this.getFileContent2();
  }

  saveContent(content) {
    const isOpenSocket = this.getSetting('isOpenSocket');
    if (isOpenSocket) {
      return this.saveContent1(content);
    }

    return this.saveContent2(content);
  }

  getFileContent1() {
    const settings = this.getSettings();
    const { docPath, docName } = settings;
    return this.sdocServerApi.getDocContent(docPath, docName);
  }

  saveContent1(content) {
    const settings = this.getSettings();
    const { docPath, docName } = settings;
    return this.sdocServerApi.saveDocContent(docPath, docName, content);
  }

  getFileContent2() {
    const repoID = this.getSetting('repoID');
    const docPath = this.getSetting('docPath');
    return this.api.getFileDownloadLink(repoID, docPath).then(res => {
      const downloadLink = res.data;
      return this.api.getFileContent(downloadLink);
    });
  }

  saveContent2(content) {
    const settings = this.getSettings();
    const { repoID, docPath, docName } = settings;

    const dirPath = getDirPath(docPath);
    return this.api.getUpdateLink(repoID, dirPath).then((res) => {
      const uploadLink = res.data;
      return this.api.updateFile(uploadLink, docPath, docName, content);
    });
  }

  // Notification
  readAllNotifications = () => {
    const { docUuid } = this.settings;
    const url = `/api/v2.1/seadoc/notifications/${docUuid}/`;
    return this.api.req.put(url);
  };

  deleteUnseenNotifications = (notificationIds) => {
    const { docUuid } = this.settings;
    const url = `/api/v2.1/seadoc/notifications/${docUuid}/`;
    const params = {
      ids: notificationIds
    };
    return this.api.req.delete(url, { data: params });
  };

  listUnseenNotifications = () => {
    const { docUuid } = this.settings;
    const url = `/api/v2.1/seadoc/notifications/${docUuid}/`;
    return this.api.req.get(url);
  };

  // comment
  listComments = () => {
    const { server, docUuid, accessToken } = this.sdocServerApi;
    const url = `${server}/api/v1/docs/${docUuid}/comment/`;
    return axios.get(url, { headers: { Authorization: `Token ${accessToken}` } });
  };

  updateComment = (commentId, newComment) => {
    const { server, docUuid, accessToken } = this.sdocServerApi;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/`;
    return this.api.req.put(url, newComment, { headers: { Authorization: `Token ${accessToken}` } });
  };

  deleteComment = (commentId) => {
    const { server, docUuid, accessToken } = this.sdocServerApi;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/`;
    return this.api.req.delete(url, { headers: { Authorization: `Token ${accessToken}` } });
  };

  insertComment = (comment) => {
    const { server, docUuid, accessToken } = this.sdocServerApi;
    const url = `${server}/api/v1/docs/${docUuid}/comment/`;
    return this.api.req.post(url, comment, { headers: { Authorization: `Token ${accessToken}` } });
  };

  insertReply = (commentId, reply) => {
    const { server, docUuid, accessToken } = this.sdocServerApi;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/replies/`;
    return this.api.req.post(url, reply, { headers: { Authorization: `Token ${accessToken}` } });
  };

  deleteReply = (commentId, replyId) => {
    const { server, docUuid, accessToken } = this.sdocServerApi;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/replies/${replyId}/`;
    return this.api.req.delete(url, { headers: { Authorization: `Token ${accessToken}` } });
  };

  updateReply = (commentId, replyId, reply) => {
    const { server, docUuid, accessToken } = this.sdocServerApi;
    const url = `${server}/api/v1/docs/${docUuid}/comment/${commentId}/replies/${replyId}/`;
    return this.api.req.put(url, reply, { headers: { Authorization: `Token ${accessToken}` } });
  };

  // participants
  listParticipants = () => {
    const { docUuid } = this.settings;
    const url = 'api/v2.1/seadoc/participants/' + docUuid + '/';
    return this.api.req.get(url);
  };

  addParticipants = (emails) => {
    const { docUuid } = this.settings;
    const url = 'api/v2.1/seadoc/participants/' + docUuid + '/';
    const params = { emails: emails };
    if (params.getHeaders) {
      return this.api.req.post(url, params, { headers: params.getHeaders() });
    }
    return this.api.req.post(url, params);
  };

  deleteParticipants = (email) => {
    const { docUuid } = this.settings;
    const url = 'api/v2.1/seadoc/participant/' + docUuid + '/';
    const params = { email: email };
    return this.api.req.delete(url, { data: params });
  };

  // related-users
  listRelatedUsers = () => {
    const { docUuid } = this.settings;
    const url = 'api/v2.1/seadoc/related-users/' + docUuid + '/';
    return this.api.req.get(url);
  };
}

const context = new Context();

export default context;
