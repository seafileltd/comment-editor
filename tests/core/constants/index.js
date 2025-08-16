// extension plugin
export const BLOCKQUOTE = 'blockquote';
export const BOLD = 'bold';
export const HEADER = 'header';
export const HEADER1 = 'header1';
export const ORDERED_LIST = 'ordered_list';
export const UNORDERED_LIST = 'unordered_list';
export const LIST_ITEM = 'list_item';
export const LIST_LIC = 'list_lic'; // placeholder
export const CHECK_LIST_ITEM = 'check_list_item';
export const PARAGRAPH = 'paragraph';
export const LINK = 'link';
export const HTML = 'html';
export const IMAGE = 'image';
export const TABLE_TH = 'table-th';
export const TABLE_TD = 'table-td';
export const TABLE_TR = 'table-tr';
export const FORMULA = 'formula';

export const voidChildren = [{ text: '' }];

export const ELEMENTS = {
  ha: { type: LINK },
  hblockquote: { type: BLOCKQUOTE },
  hdefault: { type: PARAGRAPH },
  hh1: { type: HEADER1 },
  himg: { type: IMAGE, children: voidChildren },
  hli: { type: LIST_ITEM },
  hlic: { type: LIST_LIC },
  hol: { type: ORDERED_LIST },
  hp: { type: PARAGRAPH },
  htd: { type: TABLE_TD },
  hth: { type: TABLE_TH },
  htodoli: { type: CHECK_LIST_ITEM },
  htr: { type: TABLE_TR },
  hul: { type: UNORDERED_LIST }
};
