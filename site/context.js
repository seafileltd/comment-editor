import axios from 'axios';
import { SeafileAPI } from 'seafile-js';
import urlJoin from 'url-join';
import SDocServerAPI from './api/sdoc-server-api';
import SdocAPI from './api/seafile-api';

class Context {

  constructor() {
    this.settings = { ...window.seafileConfig };
    this.api = null;
    this.initPromise = null;
    this.commentApi = null;
  }

  async initApi() {
    const { serviceUrl, docUuid, username, password } = this.settings;
    if (!serviceUrl || !docUuid) {
      throw new Error('请在本地配置中填写 serviceUrl 和 docUuid');
    }

    let { accessToken } = this.settings;
    if (!accessToken) {
      if (!username || !password) {
        throw new Error('请配置文档 accessToken，或提供 username 和 password');
      }
      const seafileAPI = new SeafileAPI();
      seafileAPI.init({ server: serviceUrl, username, password });
      await seafileAPI.login();
      const res = await this.getAccessToken(seafileAPI.token);
      accessToken = res.data.access_token;
      if (!accessToken) throw new Error('未获取到文档访问令牌');
      this.settings.accessToken = accessToken;
    }

    this.api = new SdocAPI(serviceUrl, accessToken);
  }

  getAccessToken(token) {
    const { serviceUrl, repoID, docUuid, docPath } = this.settings;
    const url = `/api/v2.1/seadoc/access-token/${repoID || docUuid}/`;
    return axios.get(url, {
      baseURL: serviceUrl,
      headers: { Authorization: `Token ${token}` },
      params: repoID ? { p: docPath } : undefined,
    });
  }

  async ensureApi() {
    if (!this.api) {
      if (!this.initPromise) {
        this.initPromise = this.initApi().catch(error => {
          this.initPromise = null;
          throw error;
        });
      }
      await this.initPromise;
    }
  }

  async getCommentApi() {
    if (!this.settings.sdocServer) {
      throw new Error('请在本地配置中填写 sdocServer');
    }
    await this.ensureApi();
    if (!this.commentApi) this.commentApi = new SDocServerAPI(this.settings);
    return this.commentApi;
  }

  async listComments() {
    const api = await this.getCommentApi();
    const res = await api.listComments();
    if (!Array.isArray(res.data.comments)) throw new Error('评论接口未返回有效的 comments');
    return res.data.comments;
  }

  async insertComment(content) {
    if (!this.settings.username) throw new Error('请在本地配置中填写 username');
    const api = await this.getCommentApi();
    const now = new Date();
    const pad = value => String(value).padStart(2, '0');
    const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(pad).join('-');
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join(':');
    const comment = {
      comment: content,
      detail: { element_id: '0', comment: content },
      author: this.settings.username,
      updated_at: `${date} ${time}`,
    };
    const res = await api.insertComment(comment);
    if (res.data.comment?.id == null) throw new Error('评论接口未返回有效的评论 ID');
    return { ...comment, ...res.data.comment };
  }

  uploadLocalImage = async (imageFiles) => {
    await this.ensureApi();

    const { docUuid, serviceUrl, assetsUrl = '' } = this.settings;
    const res = await this.api.uploadSdocImage(docUuid, imageFiles);
    const { relative_path: paths } = res.data;
    if (!Array.isArray(paths) || paths.length === 0 || paths.some(path => typeof path !== 'string' || !path)) {
      throw new Error('图片上传接口未返回有效的 relative_path');
    }
    return paths.map(path => urlJoin(serviceUrl, assetsUrl, path));
  };
}

export default Context;
