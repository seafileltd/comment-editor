import slateToMdString from '../../src/basic-sdk/slate-convert/slate-to-md';
import { hasCommentContent } from '../../src/basic-sdk/utils/document-utils';

const paragraph = (...children) => ({ type: 'paragraph', children });
const image = (src) => ({ type: 'image', data: { src }, children: [{ text: '' }] });

it.each([
  ['empty paragraph', [paragraph({ text: '' })], false],
  ['whitespace and zero-width placeholders', [paragraph({ text: ' \t\n\u200b' })], false],
  ['empty formatted content', [{ type: 'blockquote', children: [paragraph({ text: ' ', bold: true })] }], false],
  ['image without a source', [paragraph(image())], false],
  ['image-only comment', [paragraph(image('/image.png'))], true],
  ['unfinished mention', [paragraph({ type: 'mention_temp', children: [{ text: 'Alice' }] })], false],
  ['confirmed mention', [paragraph({ type: 'mention', children: [{ text: '@Alice' }] })], true],
  ['ordinary text', [paragraph({ text: 'Comment' })], true],
])('hasCommentContent: %s', (_description, nodes, expected) => {
  expect(hasCommentContent(nodes)).toBe(expected);
});

it.each(['\u200b', '\u200c', '\u200d', '\u200e', '\u200f', '\u2060', '\u034f', '\ufe0f'])(
  'ignores invisible formatting character %#', (text) => {
    expect(hasCommentContent([paragraph({ text })])).toBe(false);
  }
);

it('preserves joiners in text and serialized markdown', () => {
  const text = 'می\u200cخواهم 👩\u200d💻';
  const nodes = [paragraph({ text })];
  expect(hasCommentContent(nodes)).toBe(true);
  expect(nodes[0].children[0].text).toBe(text);
  expect(slateToMdString(nodes)).toBe(`${text}\n`);
});
