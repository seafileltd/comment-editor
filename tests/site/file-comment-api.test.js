import axios from 'axios';
import FileCommentContext from '../../site/file-comment-context';

jest.mock('axios', () => ({ create: jest.fn(), post: jest.fn() }));

describe('Seafile file comments and image uploads', () => {
  let previousSettings;
  let request;
  let upload;

  const commentsUrl = 'https://seafile.example.com/api2/repos/file-repo/file/comments/?p=%2Fdocs%2Fa%20b%26c.txt';

  beforeEach(() => {
    jest.resetAllMocks();
    previousSettings = window.seafileConfig;
    window.seafileConfig = {
      serviceUrl: 'https://seafile.example.com', docUuid: 'sdoc-uuid',
      accessToken: 'document-token',
      repoID: 'file-repo', filePath: '/docs/a b&c.txt', apiToken: 'user-token',
    };
    request = {
      get: jest.fn().mockResolvedValue({ data: { comments: [] } }),
      post: jest.fn().mockResolvedValue({ data: { id: 42, author_name: '文件评论作者', created_at: '2026-11-21T10:00:00Z' } }),
    };
    upload = jest.fn().mockResolvedValue({ data: [{ name: 'uploaded.png' }] });
    axios.create.mockImplementation(options => options ? request : upload);
    axios.post.mockResolvedValue({ data: { token: 'login-token' } });
  });

  afterEach(() => {
    window.seafileConfig = previousSettings;
  });

  it('uses the configured library, encoded file path and user token to load comments', async () => {
    await expect(new FileCommentContext().listComments()).resolves.toEqual([]);
    expect(request.get).toHaveBeenCalledWith(commentsUrl);
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://seafile.example.com', headers: { Authorization: 'Token user-token' },
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('posts Markdown as a file comment and reads the unwrapped response', async () => {
    await expect(new FileCommentContext().insertComment('**hello**')).resolves.toEqual(expect.objectContaining({
      id: 42, comment: '**hello**', author_name: '文件评论作者',
    }));
    const [url, form] = request.post.mock.calls[0];
    expect(url).toBe(commentsUrl);
    const body = form.getBuffer().toString();
    expect(body).toContain('name="comment"\r\n\r\n**hello**\r\n');
    expect(body).not.toContain('name="detail"');
  });

  it('uses the current UUID-based comments API when fileUuid is configured', async () => {
    Object.assign(window.seafileConfig, { fileUuid: 'file-uuid', filePath: '' });
    const context = new FileCommentContext();
    await context.listComments();
    await context.insertComment('hello');
    const url = 'https://seafile.example.com/api/v2.1/repos/file-repo/file/file-uuid/comments/';
    expect(request.get).toHaveBeenCalledWith(url);
    expect(request.post).toHaveBeenCalledWith(url, expect.any(FormData));
    expect(request.post.mock.calls[0][1].get('comment')).toBe('hello');
  });

  it('logs in with top-level credentials and shares the resulting token between requests', async () => {
    delete window.seafileConfig.apiToken;
    Object.assign(window.seafileConfig, { username: 'user@example.com', password: 'test-password' });
    request.get.mockImplementation(url => Promise.resolve(url.includes('/upload-link/')
      ? { data: 'https://files.example.com/upload' } : { data: { comments: [] } }));
    const context = new FileCommentContext();
    const file = new File(['image'], 'test.png', { type: 'image/png' });
    await Promise.all([context.listComments(), context.insertComment('hello'), context.uploadLocalImage([file])]);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith('https://seafile.example.com/api2/auth-token/', {
      username: 'user@example.com', password: 'test-password',
    });
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'https://seafile.example.com', headers: { Authorization: 'Token login-token' },
    });
  });

  it('uploads images to the library auto-upload folder and preserves existing upload query parameters', async () => {
    request.get.mockResolvedValue({ data: 'https://files.example.com/upload?permission=upload' });
    upload.mockResolvedValueOnce({ data: [{ name: 'first image.png' }] });
    const files = [new File(['first'], 'first.png', { type: 'image/png' }), new File(['second'], 'second.jpg', { type: 'image/jpeg' })];
    const urls = await new FileCommentContext().uploadLocalImage(files);
    expect(urls).toEqual([
      'https://seafile.example.com/lib/file-repo/file/images/auto-upload/first%20image.png?raw=1',
      'https://seafile.example.com/lib/file-repo/file/images/auto-upload/uploaded.png?raw=1',
    ]);
    expect(request.get).toHaveBeenCalledWith('https://seafile.example.com/api2/repos/file-repo/upload-link/?p=%2F&from=web');
    const { url, data: form } = upload.mock.calls[0][0];
    expect(url).toBe('https://files.example.com/upload?permission=upload&ret-json=1');
    expect(form.get('parent_dir')).toBe('/');
    expect(form.get('relative_path')).toBe('images/auto-upload');
    expect(form.get('file').name).toMatch(/^image-[\w-]+\.png$/);
    expect(form.get('file').size).toBe(files[0].size);
    expect(form.get('file').type).toBe('image/png');
  });

  it('does not reuse an SDoc document token as a Seafile user token', async () => {
    window.seafileConfig.apiToken = '';
    await expect(new FileCommentContext().listComments()).rejects.toThrow('apiToken');
    expect(axios.create).not.toHaveBeenCalled();
  });

  it('allows login to be retried after failure', async () => {
    window.seafileConfig.apiToken = '';
    Object.assign(window.seafileConfig, { username: 'user@example.com', password: 'test-password' });
    axios.post.mockRejectedValueOnce(new Error('Login failed'));
    const context = new FileCommentContext();
    await expect(context.listComments()).rejects.toThrow('Login failed');
    await expect(context.listComments()).resolves.toEqual([]);
    expect(axios.post).toHaveBeenCalledTimes(2);
  });

  it('does not request comments if login returns no token', async () => {
    window.seafileConfig.apiToken = '';
    Object.assign(window.seafileConfig, { username: 'user@example.com', password: 'test-password' });
    axios.post.mockResolvedValueOnce({ data: {} });
    await expect(new FileCommentContext().listComments()).rejects.toThrow('未返回 Seafile 用户 token');
    expect(request.get).not.toHaveBeenCalled();
  });

  it('requires a file path or UUID before making a request', async () => {
    window.seafileConfig.filePath = '';
    await expect(new FileCommentContext().listComments()).rejects.toThrow('filePath');
    expect(axios.create).not.toHaveBeenCalled();
  });

  it('propagates failed submissions', async () => {
    request.post.mockRejectedValue(new Error('Network Error'));
    await expect(new FileCommentContext().insertComment('hello')).rejects.toThrow('Network Error');
  });

  it('rejects invalid comment and image responses', async () => {
    const context = new FileCommentContext();
    request.get.mockResolvedValueOnce({ data: {} });
    await expect(context.listComments()).rejects.toThrow('comments');
    request.post.mockResolvedValueOnce({ data: {} });
    await expect(context.insertComment('hello')).rejects.toThrow('评论 ID');
    request.get.mockResolvedValueOnce({ data: 'https://files.example.com/upload' });
    upload.mockResolvedValueOnce({ data: [] });
    await expect(context.uploadLocalImage([new File(['image'], 'image.png', { type: 'image/png' })])).rejects.toThrow('图片文件名');
  });
});
