import {
  BLOCKQUOTE,
  ORDERED_LIST,
  UNORDERED_LIST,
  LINK,
  IMAGE,
} from './element-type';


// text style
export const TEXT_STYLE = 'text_style';
export const ITALIC = 'italic';
export const BOLD = 'bold';
const TEXT_LINK = 'text_link';

// text-align
export const TEXT_ALIGN = 'text_align';
const ALIGN_LEFT = 'align_left';
const ALIGN_RIGHT = 'align_right';
const ALIGN_CENTER = 'align_center';

export const TEXT_STYLE_MAP = {
  BOLD: BOLD,
  ITALIC: ITALIC,
  BOLD_ITALIC: `${BOLD}_${ITALIC}`,
  CODE: 'code',
  DELETE: 'delete',
  ADD: 'add',
  LINK: 'link',
};

// header menu config
export const MENUS_CONFIG_MAP = {
  [BLOCKQUOTE]: {
    id: `sdoc_${BLOCKQUOTE}`,
    iconClass: 'sdocfont sdoc-quote-left',
    text: 'Quote'
  },
  [ORDERED_LIST]: {
    id: ORDERED_LIST,
    iconClass: 'sdocfont sdoc-list-ol',
    text: 'Ordered_list'
  },
  [UNORDERED_LIST]: {
    id: UNORDERED_LIST,
    iconClass: 'sdocfont sdoc-list-ul',
    text: 'Unordered_list'
  },
  [LINK]: {
    id: `sdoc_${LINK}`,
    iconClass: 'sdocfont sdoc-link',
    text: 'Link'
  },
  [IMAGE]: {
    id: `sdoc_${IMAGE}`,
    iconClass: 'sdocfont sdoc-image',
    text: 'Image'
  },
  [TEXT_STYLE]: [
    {
      id: ITALIC,
      iconClass: 'sdocfont sdoc-italic',
      text: 'Italic',
      ariaLabel: 'italic',
      type: TEXT_STYLE_MAP.ITALIC
    },
    {
      id: BOLD,
      iconClass: 'sdocfont sdoc-bold',
      text: 'Bold',
      ariaLabel: 'bold',
      type: TEXT_STYLE_MAP.BOLD
    },
    {
      id: TEXT_LINK,
      iconClass: 'sdocfont sdoc-link',
      text: 'Insert_link',
      ariaLabel: 'link',
      type: TEXT_STYLE_MAP.LINK
    },
  ],
  [TEXT_ALIGN]: [
    {
      id: ALIGN_LEFT,
      iconClass: 'sdocfont sdoc-align-left',
      type: 'left'
    },
    {
      id: ALIGN_CENTER,
      iconClass: 'sdocfont sdoc-align-center',
      type: 'center'
    },
    {
      id: ALIGN_RIGHT,
      iconClass: 'sdocfont sdoc-align-right',
      type: 'right'
    }
  ],
};
