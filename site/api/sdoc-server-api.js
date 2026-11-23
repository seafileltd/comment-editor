import axios from 'axios';

class SDocServerAPI {

  constructor({ sdocServer, docUuid, accessToken }) {
    this.url = `${sdocServer.replace(/\/+$/, '')}/api/v1/docs/${docUuid}/comment/`;
    this.options = { headers: { Authorization: `Token ${accessToken}` } };
  }

  listComments() {
    return axios.get(this.url, this.options);
  }

  insertComment(comment) {
    return axios.post(this.url, comment, this.options);
  }
}

export default SDocServerAPI;
