import React from 'react';
import PropTypes from 'prop-types';
import { EditorComment, GlobalComment } from './components';

const CommentWrapper = ({ type, editor }) => {

  return (
    <>
      {type === 'editor' && <EditorComment editor={editor}/>}
      {type === 'global' && <GlobalComment editor={editor} />}
    </>
  );
};

CommentWrapper.propTypes = {
  editor: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['editor', 'global']).isRequired,
};

export default CommentWrapper;
