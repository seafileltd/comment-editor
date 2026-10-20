import deepCopy from 'deep-copy';
import context from '../context';
import { CLIPBOARD_ORIGIN_SDOC_KEY, IMAGE, LINK, MENTION_TEMP } from '../extension/constants';
import { generateDefaultText } from '../extension/core/utils/index';
import ObjectUtils from './object-utils';

const hasText = (value) => typeof value === 'string' && value.replace(/\p{Default_Ignorable_Code_Point}/gu, '').trim().length > 0;

export const hasCommentContent = (nodes) => nodes.some((node) => {
  if (node.type === IMAGE) return hasText(node.data?.src);
  if (node.type === MENTION_TEMP) return false;
  if (typeof node.text === 'string') return hasText(node.text);
  return Array.isArray(node.children) && hasCommentContent(node.children);
});

export const normalizeChildren = (children) => {
  // text
  if (!Array.isArray(children)) return children;

  // element
  if (Array.isArray(children) && children.length === 0) return [generateDefaultText()];

  return children.map(child => {
    // child is text
    if (ObjectUtils.hasProperty(child, 'text') && !ObjectUtils.hasProperty(child, 'children')) {
      return child;
    }
    // To resolve the issue that the children is not assigned to the new object
    if (!Object.getOwnPropertyDescriptor(child, 'children').writable) {
      child = deepCopy(child);
    }
    // child is element
    child.children = normalizeChildren(child.children);
    return child;
  });
};

export const normalizeCopyNodes = (editor, elements) => {
  if (!Array.isArray(elements) || elements.length === 0) return [];
  return elements.map(element => {
    element.children.forEach(child => {
      const { type, doc_uuid } = child;
      if (['sdoc_link', 'file_link'].includes(type)) {
        child['type'] = LINK;
        child['href'] = context.getFileUrlByUuid(doc_uuid);
      }
    });
    return element;
  });
};

export const setOriginSdocKey = (event) => {
  const docUuid = context.getSetting('docUuid');
  event.clipboardData.setData(`text/${CLIPBOARD_ORIGIN_SDOC_KEY}`, docUuid);
};

export const getSlateFragmentAttribute = (dataTransfer) => {
  const catchSlateFragment = /data-slate-fragment="(.+?)"/m;
  const htmlData = dataTransfer.getData('text/html');
  const [, fragment] = htmlData.match(catchSlateFragment) || [];
  return fragment;
};
