import React, { useEffect } from 'react';
import classNames from 'classnames';
import Tooltip from '../../../../components/tooltip';
import { hasCommentContent } from '../../../../utils/document-utils';

import './style.css';

const PostCommentBtn = ({ editor, onSubmit, submitBtnText, onCancel }) => {
  const disabled = !hasCommentContent(editor.children);

  useEffect(() => {
    document.addEventListener('keydown', onCancel, false);
    document.addEventListener('click', onCancel, false);
    return () => {
      document.removeEventListener('keydown', onCancel, false);
      document.removeEventListener('click', onCancel, false);
    };
  }, [onCancel]);

  return (
    <div role="button" id='comment-editor-comment-btn' aria-disabled={disabled}>
      <i className={classNames('sdocfont sdoc-save sdoc-comment-btn', { disabled })} onClick={disabled ? () => {} : onSubmit} ></i>
      <Tooltip target="comment-editor-comment-btn" >
        {submitBtnText}
      </Tooltip>
    </div>
  );
};

export default PostCommentBtn;
