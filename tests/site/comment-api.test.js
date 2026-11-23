import axios from 'axios';
import Context from '../../site/context';

jest.mock('axios', () => ({ create: jest.fn(), get: jest.fn(), post: jest.fn() }));

describe('demo server comments', () => {
  let previousSettings;

  beforeEach(() => {
    jest.resetAllMocks();
    previousSettings = window.seafileConfig;
    window.seafileConfig = {
      serviceUrl: 'https://seafile.example.com', sdocServer: 'https://sdoc.example.com/',
      accessToken: 'document-token', username: 'user@example.com',
      docUuid: 'doc-uuid',
    };
    axios.create.mockReturnValue({ post: jest.fn().mockResolvedValue({ data: { relative_path: ['image.png'] } }) });
    axios.get.mockResolvedValue({ data: { comments: [] } });
    axios.post.mockResolvedValue({ data: { comment: { id: 42, user_name: '服务端作者' } } });
  });

  afterEach(() => {
    window.seafileConfig = previousSettings;
  });

  it('loads comments from sdocServer using the document token', async () => {
    const comments = [{ id: 42, comment: 'existing comment' }];
    axios.get.mockResolvedValue({ data: { comments } });
    await expect(new Context().listComments()).resolves.toEqual(comments);
    expect(axios.get).toHaveBeenCalledWith('https://sdoc.example.com/api/v1/docs/doc-uuid/comment/', {
      headers: { Authorization: 'Token document-token' },
    });
  });

  it('uses the document token even when a file comment token is configured', async () => {
    Object.assign(window.seafileConfig, { sdocServer: 'https://other-sdoc.example.com', docUuid: 'other-doc', apiToken: 'user-token' });
    await new Context().listComments();
    expect(axios.get).toHaveBeenCalledWith('https://other-sdoc.example.com/api/v1/docs/other-doc/comment/', {
      headers: { Authorization: 'Token document-token' },
    });
    expect(window.seafileConfig.accessToken).toBe('document-token');
    expect(window.seafileConfig.apiToken).toBe('user-token');
  });

  it('posts a global Markdown comment and uses the returned server ID and author', async () => {
    const result = await new Context().insertComment('**hello**');
    expect(axios.post).toHaveBeenCalledWith('https://sdoc.example.com/api/v1/docs/doc-uuid/comment/', {
      comment: '**hello**', detail: { element_id: '0', comment: '**hello**' },
      author: 'user@example.com', updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
    }, { headers: { Authorization: 'Token document-token' } });
    expect(result).toEqual(expect.objectContaining({ id: 42, user_name: '服务端作者', comment: '**hello**' }));
  });

  it('shares document authentication between listing, posting and image upload', async () => {
    Object.assign(window.seafileConfig, { accessToken: '', password: 'test-password' });
    axios.post.mockImplementation(url => Promise.resolve(url.endsWith('/auth-token/')
      ? { data: { token: 'user-token' } } : { data: { comment: { id: 42 } } }));
    axios.get.mockImplementation(url => Promise.resolve(url.includes('/access-token/')
      ? { data: { access_token: 'new-document-token' } } : { data: { comments: [] } }));
    const context = new Context();
    const file = new File(['image'], 'test.png', { type: 'image/png' });
    await Promise.all([context.listComments(), context.insertComment('hello'), context.uploadLocalImage([file])]);
    expect(axios.post.mock.calls.filter(([url]) => url.endsWith('/auth-token/'))).toHaveLength(1);
    expect(axios.get.mock.calls.filter(([url]) => url.includes('/access-token/'))).toHaveLength(1);
    expect(axios.post).toHaveBeenLastCalledWith(expect.stringContaining('/comment/'), expect.any(Object), {
      headers: { Authorization: 'Token new-document-token' },
    });
  });

  it('rejects missing server configuration without sending a request', async () => {
    window.seafileConfig.sdocServer = '';
    await expect(new Context().listComments()).rejects.toThrow('sdocServer');
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('requires the configured author before sending a comment', async () => {
    window.seafileConfig.username = '';
    await expect(new Context().insertComment('hello')).rejects.toThrow('username');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('propagates submission failures', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    await expect(new Context().insertComment('hello')).rejects.toThrow('Network Error');
  });

  it('rejects invalid list or submission responses', async () => {
    axios.get.mockResolvedValue({ data: {} });
    axios.post.mockResolvedValue({ data: {} });
    const context = new Context();
    await expect(context.listComments()).rejects.toThrow('comments');
    await expect(context.insertComment('hello')).rejects.toThrow('评论 ID');
  });
});
