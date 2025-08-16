import { Editor, Transforms, Element, Node } from '@seafile/slate';
import slugid from 'slugid';
import { BLOCKQUOTE, CHECK_LIST_ITEM, IMAGE, ORDERED_LIST, PARAGRAPH, UNORDERED_LIST } from '../../constants';
import { focusEditor, getNodeType } from '../../core';

export const isMenuDisabled = (editor, readonly) => {
  if (readonly) return true;
  if (editor.selection == null) return true;

  const [nodeEntry] = Editor.nodes(editor, {
    match: n => {
      const type = getNodeType(n);

      // Only available for p and blockquote
      if (type === PARAGRAPH) return true;
      if (type === BLOCKQUOTE) return true;
      if (type === UNORDERED_LIST) return true;
      if (type === ORDERED_LIST) return true;
      if (type === CHECK_LIST_ITEM) return true;
      if (type && type.startWith && type.startWith('header')) return true;
      if (type === IMAGE) return true;

      return false;
    },
    universal: true,
    mode: 'highest', // Match top level
  });

  // Match to p blockquote, do not disable
  if (nodeEntry) {
    return false;
  }
  // 未匹配到，则禁用
  return true;
};

export const getBlockQuoteType = (editor) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => getNodeType(n) === BLOCKQUOTE,
    universal: true,
  });

  if (!match) return PARAGRAPH;
  const [n] = match;

  return getNodeType(n);
};

// If cursor is in callout, insert block quote in callout, otherwise wrap block quote directly
export const setBlockQuoteType = (editor, active) => {
  if (!active) {
    const blockquoteNode = {
      id: slugid.nice(),
      type: BLOCKQUOTE,
    };

    Transforms.wrapNodes(editor, blockquoteNode, {
      mode: 'highest',
      match: n => {
        return Element.isElement(n) && Editor.isBlock(editor, n);
      },
    });
  } else {

    Transforms.unwrapNodes(editor, {
      mode: 'highest',
      match: (n) => {
        return Element.isElement(n) && Editor.isBlock(editor, n);
      },
    });
  }
};

export const getFormattedElements = (data) => {
  const elements = [];
  let arr = [];
  data.forEach((item) => {
    if ([BLOCKQUOTE].includes(item?.type)) {
      // Insert quote block
      if (arr.length !== 0) {
        const blockquoteNode = { id: slugid.nice(), type: BLOCKQUOTE };
        blockquoteNode['children'] = arr;
        elements.push(blockquoteNode);
        arr = [];
      }
      // Merge quote block
      let preElement = elements[elements.length - 1];
      if (preElement?.type === BLOCKQUOTE && item?.type === BLOCKQUOTE) {
        elements[elements.length - 1] = { ...preElement, children: [...preElement.children, ...item.children] };
      } else {
        elements.push(item);
      }
    } else {
      arr.push(item);
    }
  });
  return elements;
};

export const getFormattedRestElements = (data) => {
  const restElements = data.slice(0);
  data.forEach((item, index) => {
    if (Node.string(item).length === 0) {
      restElements.splice(index, 1);
    }

    // Split quote block
    if (item?.type === BLOCKQUOTE) {
      restElements.splice(index, 1, ...item.children);
    }
  });
  return restElements;
};

export const insertBlockQuote = (editor, active) => {
  setBlockQuoteType(editor, active);
  focusEditor(editor);
};
