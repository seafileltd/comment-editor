import React from 'react';
import { TEXT_STYLE_MAP } from '../../constants';
import Caret from './caret';

const renderText = (props) => {
  const { attributes, children, leaf } = props;
  let { text, ...rest } = leaf;

  let markedChildren = React.cloneElement(children);
  let style = {};
  // The following is a workaround for a Chromium bug where,
  // if you have an inline at the end of a block,
  // clicking the end of a block puts the cursor inside the inline
  // instead of inside the final {text: ''} node
  // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
  if (!text.length) {
    style['paddingLeft'] = '0.1px';
  }
  if (leaf.isCaret) {
    style['position'] = 'relative';
    style['display'] = 'inline-block';
    style['minWidth'] = '2px';
  }

  // Add temporary marks for selection in AI or context comment
  if ((leaf.sdoc_ai || leaf.comment) && leaf.text.trim()) {
    style['padding'] = '3px 0';
    style['backgroundColor'] = '#a9c9ed';
  }


  if (leaf.computed_background_color) {
    style['backgroundColor'] = leaf.computed_background_color;
  }

  if (leaf[TEXT_STYLE_MAP.BOLD]) {
    markedChildren = <strong>{markedChildren}</strong>;
  }

  if (leaf[TEXT_STYLE_MAP.ITALIC]) {
    markedChildren = <i>{markedChildren}</i>;
  }

  return (
    <span data-id={leaf.id} {...attributes} style={style} className={Object.keys(rest).join(' ')}>
      {leaf.isCaret ? <Caret {...leaf} /> : null}
      {leaf.isCaret && <span key={Math.random()} data-slate-zero-width="z" data-slate-length="0">{'\uFEFF'}</span>}
      {!leaf.isCaret && markedChildren}
    </span>
  );
};

export default renderText;
