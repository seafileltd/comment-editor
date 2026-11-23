import { SeafileAPI } from 'seafile-js';
import slugid from 'slugid';
import urlJoin from 'url-join';

class FileCommentContext {

  constructor() {
    this.settings = { ...window.seafileConfig };
    this.api = null;
    this.initPromise = null;
  }

  async initApi() {
    const { serviceUrl, repoID, filePath, fileUuid, apiToken, username, password } = this.settings;
    if (!serviceUrl || !repoID || (!filePath && !fileUuid)) {
      throw new Error('请在本地配置中填写 serviceUrl、repoID，以及 filePath 或 fileUuid');
    }
    if (!apiToken && (!username || !password)) {
      throw new Error('请配置 Seafile 用户 apiToken，或在本地配置中填写 username 和 password');
    }

    const api = new SeafileAPI();
    api.init({ server: serviceUrl.replace(/\/+$/, ''), token: apiToken, username, password });
    if (!apiToken) {
      await api.login();
      if (!api.token) throw new Error('登录响应未返回 Seafile 用户 token');
    }
    this.api = api;
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

  async listComments() {
    await this.ensureApi();
    const { repoID, filePath, fileUuid } = this.settings;
    const res = fileUuid
      ? await this.api.req.get(this.getCommentsUrl())
      : await this.api.listComments(repoID, filePath);
    if (!Array.isArray(res.data.comments)) throw new Error('评论接口未返回有效的 comments');
    return res.data.comments;
  }

  async insertComment(content) {
    await this.ensureApi();
    const { repoID, filePath, fileUuid } = this.settings;
    let res;
    if (fileUuid) {
      const form = new FormData();
      form.append('comment', content);
      res = await this.api.req.post(this.getCommentsUrl(), form);
    } else {
      res = await this.api.postComment(repoID, filePath, content);
    }
    if (res.data.id == null) throw new Error('评论接口未返回有效的评论 ID');
    return { comment: content, ...res.data };
  }

  getCommentsUrl() {
    const { serviceUrl, repoID, fileUuid } = this.settings;
    return `${serviceUrl.replace(/\/+$/, '')}/api/v2.1/repos/${repoID}/file/${fileUuid}/comments/`;
  }

  uploadLocalImage = async (imageFiles) => {
    await this.ensureApi();
    const { repoID, serviceUrl } = this.settings;
    return Promise.all(imageFiles.map(async imageFile => {
      const link = await this.api.getFileServerUploadLink(repoID, '/');
      const uploadLink = new URL(link.data);
      uploadLink.searchParams.set('ret-json', '1');
      const extension = imageFile.name.slice(imageFile.name.lastIndexOf('.'));
      const file = new File([imageFile], `image-${slugid.nice()}${extension}`, { type: imageFile.type });
      const form = new FormData();
      form.append('parent_dir', '/');
      form.append('relative_path', 'images/auto-upload');
      form.append('file', file);
      const res = await this.api.uploadImage(uploadLink.toString(), form);
      const name = res.data?.[0]?.name;
      if (!name || typeof name !== 'string') throw new Error('图片上传接口未返回有效的图片文件名');
      return urlJoin(serviceUrl, 'lib', repoID, 'file/images/auto-upload', encodeURIComponent(name)) + '?raw=1';
    }));
  };
}

export default FileCommentContext;
