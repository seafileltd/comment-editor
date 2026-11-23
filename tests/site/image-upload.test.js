import axios from 'axios';
import SeafileAPI from '../../site/api/seafile-api';
import Context from '../../site/context';

jest.mock('axios', () => ({
  create: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
}));

describe('demo image upload API', () => {
  let previousSettings;
  let request;
  let file;

  beforeEach(() => {
    jest.resetAllMocks();
    previousSettings = window.seafileConfig;
    window.seafileConfig = {
      serviceUrl: 'https://seafile.example.com',
      docUuid: 'doc-uuid',
      assetsUrl: '/assets/',
      accessToken: 'document-token',
    };
    request = { post: jest.fn().mockResolvedValue({ data: { relative_path: ['images/uploaded.png'] } }) };
    axios.create.mockReturnValue(request);
    axios.post.mockResolvedValue({ data: { token: 'user-token' } });
    axios.get.mockResolvedValue({ data: { access_token: 'document-token' } });
    file = new File(['image content'], 'original.png', { type: 'image/png' });
  });

  afterEach(() => {
    window.seafileConfig = previousSettings;
  });

  it('posts renamed image files as multipart data using the document token', async () => {
    const api = new SeafileAPI('https://seafile.example.com', 'document-token');
    const secondFile = new File(['second image'], 'second.jpg', { type: 'image/jpeg' });
    const textFile = new File(['text'], 'note.txt', { type: 'text/plain' });

    await api.uploadSdocImage('doc-uuid', [file, textFile, secondFile]);

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://seafile.example.com',
      headers: { Authorization: 'Token document-token' },
    });
    const [url, form] = request.post.mock.calls[0];
    expect(url).toBe('/api/v2.1/seadoc/upload-image/doc-uuid/');
    expect(form).toBeInstanceOf(FormData);
    const images = form.getAll('file');
    expect(images).toHaveLength(2);
    expect(images[0].name).toMatch(/^image-[\w-]+\.png$/);
    expect(images[1].name).toMatch(/^image-[\w-]+\.jpg$/);
    expect(images[0].name).not.toBe(images[1].name);
    expect(images[0].type).toBe(file.type);
    expect(images[0].size).toBe(file.size);
  });

  it('uses the configured document token and returns every image as a complete URL', async () => {
    request.post.mockResolvedValue({ data: { relative_path: ['images/first.png', '/images/second.png'] } });
    const context = new Context();

    await expect(context.uploadLocalImage([file])).resolves.toEqual([
      'https://seafile.example.com/assets/images/first.png',
      'https://seafile.example.com/assets/images/second.png',
    ]);
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('logs in and obtains a document token with the library and file path', async () => {
    Object.assign(window.seafileConfig, {
      accessToken: '', username: 'test@example.com', password: 'test-password',
      repoID: 'repo-id', docPath: '/folder/a b&c.sdoc',
    });
    const context = new Context();

    await context.uploadLocalImage([file]);

    expect(axios.post).toHaveBeenCalledWith('https://seafile.example.com/api2/auth-token/', {
      username: 'test@example.com', password: 'test-password',
    });
    expect(axios.get).toHaveBeenCalledWith('/api/v2.1/seadoc/access-token/repo-id/', {
      baseURL: 'https://seafile.example.com',
      headers: { Authorization: 'Token user-token' },
      params: { p: '/folder/a b&c.sdoc' },
    });
    expect(axios.create).toHaveBeenLastCalledWith({
      baseURL: 'https://seafile.example.com',
      headers: { Authorization: 'Token document-token' },
    });
  });

  it('uses the document UUID to obtain a token when no library is configured', async () => {
    const context = new Context();
    await context.getAccessToken('user-token');
    expect(axios.get).toHaveBeenCalledWith('/api/v2.1/seadoc/access-token/doc-uuid/', expect.objectContaining({
      headers: { Authorization: 'Token user-token' },
      params: undefined,
    }));
  });

  it('shares authentication between concurrent image uploads', async () => {
    Object.assign(window.seafileConfig, {
      accessToken: '', username: 'test@example.com', password: 'test-password',
    });
    const context = new Context();
    await Promise.all([context.uploadLocalImage([file]), context.uploadLocalImage([file])]);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(request.post).toHaveBeenCalledTimes(2);
  });

  it('allows initialization to be retried after a login failure', async () => {
    Object.assign(window.seafileConfig, {
      accessToken: '', username: 'test@example.com', password: 'test-password',
    });
    axios.post.mockRejectedValueOnce(new Error('Login failed'));
    const context = new Context();
    await expect(context.uploadLocalImage([file])).rejects.toThrow('Login failed');
    await expect(context.uploadLocalImage([file])).resolves.toEqual(['https://seafile.example.com/assets/images/uploaded.png']);
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it('propagates upload failures to the editor', async () => {
    request.post.mockRejectedValue(new Error('Upload failed'));
    await expect(new Context().uploadLocalImage([file])).rejects.toThrow('Upload failed');
  });

  it.each([undefined, [], ['']])('rejects missing or empty image paths: %j', async (paths) => {
    request.post.mockResolvedValue({ data: { relative_path: paths } });
    await expect(new Context().uploadLocalImage([file])).rejects.toThrow('relative_path');
  });

  it('rejects a missing docUuid before making an upload request', async () => {
    delete window.seafileConfig.docUuid;
    await expect(new Context().uploadLocalImage([file])).rejects.toThrow('docUuid');
    expect(axios.create).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });
});
