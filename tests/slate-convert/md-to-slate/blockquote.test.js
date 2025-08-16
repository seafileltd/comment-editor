
import { mdStringToSlate } from '../../../src/basic-sdk';
import { formatChildren } from '../../core';

describe('blockquote test', () => {
  it('blockquote > paragraph', () => {
    const mdString = '> nihaode';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'nihaode' }
          ]
        },
      ]
    }];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > list', () => {
    const mdString = '> name \n > - list_item1 \n > - list_item2 \n >   - list_item_child 2.1 \n >   - list_item_child 2.2 ';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            { text: 'name' },
          ]
        },
        {
          type: 'unordered_list',
          children: [
            {
              type: 'list_item',
              children: [
                { type: 'paragraph', children: [{ text: 'list_item1' }] },
              ]
            },
            {
              type: 'list_item',
              children: [
                { type: 'paragraph', children: [{ text: 'list_item2' }] },
                { type: 'unordered_list', children: [
                  {
                    type: 'list_item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'list_item_child 2.1' }] },
                    ]
                  },
                  {
                    type: 'list_item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'list_item_child 2.2' }] },
                    ]
                  },
                ] },
              ]
            }
          ]
        },
      ]
    }];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
