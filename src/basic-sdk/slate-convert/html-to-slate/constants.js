export const BLOCKQUOTE = 'blockquote';
export const HEADER = 'header';
// each header type should be start with HEADER, all of justices should based on HEADER
export const HEADER1 = `${HEADER}1`;
export const ORDERED_LIST = 'ordered_list'; // <ol>
export const UNORDERED_LIST = 'unordered_list'; // <ul> // unordered_list can not work
export const LIST_ITEM = 'list_item'; // <li>
export const CHECK_LIST_ITEM = 'check_list_item';
export const PARAGRAPH = 'paragraph';
export const IMAGE = 'image';
export const LINK = 'link';
export const FORMULA = 'formula';

export const TOP_LEVEL_TYPES = [
  BLOCKQUOTE,
  HEADER1,
  ORDERED_LIST,
  UNORDERED_LIST,
  CHECK_LIST_ITEM,
  PARAGRAPH,
];

export const INLINE_LEVEL_TYPES = [
  IMAGE,
  LINK,
];

export const HEADER_LIST = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
export const HEADER_TYPE_MAP = {
  H1: HEADER1,
};
