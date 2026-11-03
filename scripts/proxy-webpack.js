const http = require('http');

module.exports = async function proxyWebpack(ctx, port) {
  const filename = ctx.path.split('/').pop();
  if (!/^[\w.-]+$/.test(filename) || filename === '.' || filename === '..') {
    ctx.throw(400, 'Invalid webpack asset path');
  }

  const response = await new Promise((resolve, reject) => {
    // Keep the destination separate from the request path; do not follow redirects.
    const request = http.get({
      hostname: '127.0.0.1',
      port,
      path: `/${filename}${ctx.search}`,
      agent: false,
    }, resolve);
    request.on('error', reject);
  });

  if (response.statusCode < 200 || response.statusCode >= 300) {
    response.resume();
    ctx.throw(502, 'Failed to fetch webpack asset');
  }

  ctx.type = response.headers['content-type'] || 'application/octet-stream';
  ctx.body = response;
};
