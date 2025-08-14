import React from 'react';
import PropTypes from 'prop-types';
import useSelectionUpdate from '../../../hooks/use-selection-update';
import EventBus from '../../../utils/event-bus';
import { MenuGroup } from '../../commons';
import { ORDERED_LIST, UNORDERED_LIST, IMAGE, BLOCKQUOTE, LINK } from '../../constants';
import QuoteMenu from '../../plugins/blockquote/menu';
import ImageMenu from '../../plugins/image/menu';
import LinkMenu from '../../plugins/link/menu';
import ListMenu from '../../plugins/list/menu';
import CommentEditorTextStyleMenuList from '../../plugins/text-style/menu/comemnt-editor-menu';
import PostCommentBtn from './post-comment';

const CommentEditorToolbar = ({ editor, readonly = false, onSubmit, submitBtnText, onCancel, toolMenus }) => {
  useSelectionUpdate();
  const eventBus = EventBus.getInstance();
  return (
    <div className='comment-editor-toolbar' style={{ justifyContent: toolMenus.length === 0 ? 'end' : '' }}>
      {toolMenus.length !== 0 && (
        <MenuGroup className="menu-group comment-editor-menu-group">
          {toolMenus.includes('text_style') && (<CommentEditorTextStyleMenuList editor={editor} readonly={readonly} />)}
          {toolMenus.includes(BLOCKQUOTE) && (<QuoteMenu editor={editor} readonly={readonly} />)}
          {toolMenus.includes(UNORDERED_LIST) && (<ListMenu editor={editor} type={UNORDERED_LIST} readonly={readonly}/>)}
          {toolMenus.includes(ORDERED_LIST) && (<ListMenu editor={editor} type={ORDERED_LIST} readonly={readonly} />)}
          {toolMenus.includes(LINK) && (<LinkMenu editor={editor} readonly={readonly} eventBus={eventBus} />)}
          {toolMenus.includes(IMAGE) && (<ImageMenu editor={editor} readonly={readonly} eventBus={eventBus} />)}
        </MenuGroup>
      )}
      <div className='comment-editor-toolbar-right'>
        <PostCommentBtn editor={editor} onSubmit={onSubmit} submitBtnText={submitBtnText} onCancel={onCancel} />
      </div>
    </div>
  );
};

CommentEditorToolbar.propTypes = {
  readonly: PropTypes.bool,
  editor: PropTypes.object,
  onSubmit: PropTypes.func,
  submitBtnText: PropTypes.string,
  onCancel: PropTypes.func,
};

export default CommentEditorToolbar;
