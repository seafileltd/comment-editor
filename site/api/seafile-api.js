import axios from 'axios';
import slugid from 'slugid';

class SeafileAPI {

  constructor(server, token) {
    this.req = axios.create({
      baseURL: server,
      headers: { Authorization: 'Token ' + token },
    });
  }

  getImageFileNameWithUuid(file) {
    return 'image-' + slugid.nice() + file.name.slice(file.name.lastIndexOf('.'));
  }

  uploadSdocImage(docUuid, imageFiles) {
    const url = '/api/v2.1/seadoc/upload-image/' + docUuid + '/';
    const form = new FormData();
    for (const fileItem of imageFiles) {
      if (fileItem.type.startsWith('image/')) {
        const fileName = this.getImageFileNameWithUuid(fileItem);
        const file = new File([fileItem], fileName, { type: fileItem.type });
        form.append('file', file);
      }
    }
    return this.req.post(url, form);
  }
}

export default SeafileAPI;
