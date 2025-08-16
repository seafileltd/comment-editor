import { formatSlateToMd } from '../../../src/basic-sdk/slate-convert/slate-to-md/transform';

describe('blockquote test', () => {
  it('blockquote > paragraph', () => {
    const slateNodes = [{
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
    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'nihaode',
            }
          ]
        },
      ]
    }];

    expect(formatSlateToMd(slateNodes)).toEqual(expectResult);
  });
});

describe('blockquote test', () => {
  it('blockquote > list', () => {
    const slateNodes = [{
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

    const expectResult = [{
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: 'name'
            },
          ]
        },
        {
          type: 'list',
          'loose': true,
          'ordered': false,
          'start': 1,
          children: [
            {
              type: 'listItem',
              loose: false,
              checked: null,
              children: [
                { type: 'paragraph', children: [{ type: 'text', value: 'list_item1' }] },
              ]
            },
            {
              type: 'listItem',
              'loose': true,
              checked: null,
              children: [
                { type: 'paragraph', children: [{ type: 'text', value: 'list_item2' }] },
                {
                  type: 'list',
                  'loose': false,
                  'ordered': false,
                  'start': 1,
                  children: [
                    {
                      type: 'listItem',
                      'loose': false,
                      'checked': null,
                      children: [
                        { type: 'paragraph', children: [{ type: 'text', value: 'list_item_child 2.1' }] },
                      ]
                    },
                    {
                      type: 'listItem',
                      'loose': false,
                      checked: null,
                      children: [
                        { type: 'paragraph', children: [{ type: 'text', value: 'list_item_child 2.2' }] },
                      ]
                    },
                  ] },
              ]
            }
          ]
        },
      ]
    }];

    expect(formatSlateToMd(slateNodes)).toEqual(expectResult);
  });
});
