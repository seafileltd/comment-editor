/** @jsx jsx */
import { jsx, createSdocEditor, formatChildren } from '../../../core';
import { BlockquotePlugin } from '../../../../src/basic-sdk/extension/plugins';

describe('delete in only one child blockquote at the end', () => {
  it('change paragraph to checkbox', () => {
    const input = (
      <editor>
        <hblockquote><hp>aaaa<cursor /></hp></hblockquote>
      </editor>
    );

    const output = (
      <editor>
        <hblockquote><hp>aaa</hp></hblockquote>
      </editor>
    );

    const plugins = [BlockquotePlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.deleteBackward();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});

describe('delete in only one child blockquote at the start', () => {
  it('change paragraph to checkbox', () => {
    const input = (
      <editor>
        <hblockquote><hp><cursor />aaaa</hp></hblockquote>
      </editor>
    );

    const output = (
      <editor>
        <hp>aaaa</hp>
      </editor>
    );

    const plugins = [BlockquotePlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.deleteBackward();

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

});
