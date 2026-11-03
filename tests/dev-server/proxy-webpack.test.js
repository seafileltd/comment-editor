/** @jest-environment node */

const http = require('http');
const Koa = require('koa');
const proxyWebpack = require('../../scripts/proxy-webpack');

const listen = server => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const close = server => !server || !server.listening ? Promise.resolve() : new Promise((resolve, reject) => {
  server.close(error => error ? reject(error) : resolve());
});
const get = (port, path) => new Promise((resolve, reject) => {
  const request = http.get({ hostname: '127.0.0.1', port, path, agent: false }, response => {
    const chunks = [];
    response.on('data', chunk => chunks.push(chunk));
    response.on('end', () => resolve({
      status: response.statusCode,
      headers: response.headers,
      body: Buffer.concat(chunks).toString(),
    }));
    response.on('error', reject);
  });
  request.on('error', reject);
});

describe('webpack development proxy', () => {
  let upstream;
  let proxy;
  let target;
  let onUpstream;
  let onTarget;
  let onError;
  let port;

  beforeEach(async () => {
    onUpstream = jest.fn((request, response) => {
      response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      response.end('console.log("webpack");');
    });
    onTarget = jest.fn((request, response) => response.end('private data'));
    onError = jest.fn();
    upstream = http.createServer((request, response) => onUpstream(request, response));
    target = http.createServer(onTarget);
    await listen(upstream);
    await listen(target);

    const app = new Koa();
    app.on('error', onError);
    app.use(ctx => proxyWebpack(ctx, upstream.address().port));
    proxy = http.createServer(app.callback());
    await listen(proxy);
    port = proxy.address().port;
  });

  afterEach(async () => {
    await Promise.all([close(proxy), close(upstream), close(target)]);
  });

  it('serves scripts from the configured webpack server and preserves query strings', async () => {
    const response = await get(port, '/assets/app.js?cache=1');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/javascript; charset=utf-8');
    expect(response.body).toBe('console.log("webpack");');
    expect(onUpstream.mock.calls[0][0].url).toBe('/app.js?cache=1');
    expect(onError).not.toHaveBeenCalled();
  });

  it('serves hot-update JSON without adding a second leading slash', async () => {
    onUpstream.mockImplementation((request, response) => {
      response.setHeader('Content-Type', 'application/json');
      response.end('{"c":["app"]}');
    });
    const response = await get(port, '/app.123.hot-update.json?cache=1');
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ c: ['app'] });
    expect(response.headers['content-type']).toMatch(/^application\/json/);
    expect(onUpstream.mock.calls[0][0].url).toBe('/app.123.hot-update.json?cache=1');
  });

  it.each([
    address => `//${address}/app.js`,
    address => `/http://${address}/app.js`,
    address => `/app.js?url=http://${address}/private`,
  ])('keeps attacker-controlled URL syntax on the configured destination (%#)', async makePath => {
    const address = `127.0.0.1:${target.address().port}`;
    const response = await get(port, makePath(address));
    expect(response.status).toBe(200);
    expect(onUpstream).toHaveBeenCalledTimes(1);
    expect(onUpstream.mock.calls[0][0].headers.host).toBe(`127.0.0.1:${upstream.address().port}`);
    expect(onTarget).not.toHaveBeenCalled();
  });

  it.each([301, 302, 303, 307, 308])('does not follow an upstream %i redirect', async status => {
    onUpstream.mockImplementation((request, response) => {
      response.writeHead(status, { Location: `http://127.0.0.1:${target.address().port}/private` });
      response.end();
    });
    const response = await get(port, '/app.js');
    expect(response.status).toBe(502);
    expect(response.headers.location).toBeUndefined();
    expect(onTarget).not.toHaveBeenCalled();
  });

  it.each(['/..', '/%2e%2e%2fprivate.js', '/..\\private.js', '/app.js%0d%0aHost:evil'])('rejects unsafe asset paths: %s', async path => {
    const response = await get(port, path);
    expect(response.status).toBe(400);
    expect(onUpstream).not.toHaveBeenCalled();
    expect(onTarget).not.toHaveBeenCalled();
  });

  it('returns an error for unsuccessful upstream responses', async () => {
    onUpstream.mockImplementation((request, response) => {
      response.writeHead(404);
      response.end('Not found');
    });
    expect((await get(port, '/missing.js')).status).toBe(502);
  });

  it('handles connection failures', async () => {
    onUpstream.mockImplementation((request, response) => response.destroy());
    expect((await get(port, '/app.js')).status).toBe(500);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
