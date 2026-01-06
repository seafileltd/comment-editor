import { processor } from '../../../src/basic-sdk';

const mdString = '[xiaoqiang](http://127.0.0.1/shuntian/learning/index.html)';

describe('link test', () => {
  it('paragraph > link', async () => {
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p><a href="http://127.0.0.1/shuntian/learning/index.html">xiaoqiang</a></p>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('link test 2', () => {
  it('paragraph > link', async () => {
    const mdString = '<a href=https://google.com>Click ME</font></a>';
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p>&#x3C;a href=https://google.com>Click ME&#x3C;/font>&#x3C;/a></p>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('link test 3', () => {
  it('paragraph > link', async () => {
    const mdString = '<a href="https://google.com">Click ME</font></a>';
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p>&#x3C;a href="https://google.com">Click ME&#x3C;/font>&#x3C;/a></p>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('link test 4', () => {
  it('paragraph > link', async () => {
    const mdString = '<img/src/onerror=alert(document.cookie)>';
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p>&#x3C;img/src/onerror=alert(document.cookie)></p>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('link test 5', () => {
  it('paragraph > link', async () => {
    const mdString = '<a href=\'javascript:alert(0)\'>add</a>';
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p>&#x3C;a href='javascript:alert(0)'>add&#x3C;/a></p>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('link test 6', () => {
  it('paragraph > link', async () => {
    const mdString = '"<script>alert(1)</script>"@seafile.com';
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p>"&#x3C;script>alert(1)&#x3C;/script>"@seafile.com</p>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('link test 7', () => {
  it('paragraph > link', async () => {
    const mdString = '<b onmouseover=alert(\'Wufff!\')>click me!</b>';
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = `
<p>&#x3C;b onmouseover=alert('Wufff!')>click me!&#x3C;/b></p>
`;

    expect(string).toEqual(expectResult);
  });
});

describe('link test 8', () => {
  it('paragraph > link', async () => {
    const mdString = '<img src="http://url.to.file.which/not.exist" onerror=alert(document.cookie);>';
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = '&#x3C;img src="http://url.to.file.which/not.exist" onerror=alert(document.cookie);>';

    expect(string).toEqual(expectResult);
  });
});

describe('link test 9', () => {
  it('paragraph > link', async () => {
    const mdString = '<META HTTP-EQUIV="refresh" CONTENT="0;url=data:text/html;base64,PHNjcmlwdD5hbGVydCgndGVzdDMnKTwvc2NyaXB0Pg">';
    const data = await processor.process(mdString);
    const string = String(data);
    const expectResult = '&#x3C;META HTTP-EQUIV="refresh" CONTENT="0;url=data:text/html;base64,PHNjcmlwdD5hbGVydCgndGVzdDMnKTwvc2NyaXB0Pg">';

    expect(string).toEqual(expectResult);
  });
});
