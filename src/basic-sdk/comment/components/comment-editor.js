import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, Transforms, Node } from '@seafile/slate';
import { ReactEditor, Editable, Slate } from '@seafile/slate-react';
import classNames from 'classnames';
import isHotkey from 'is-hotkey';
import PropTypes from 'prop-types';
import scrollIntoView from 'scroll-into-view-if-needed';
import { COMMENT_EDITOR, COMMENT_EDITOR_EDIT_AREA_WIDTH, INTERNAL_EVENT, KeyCodes } from '../../constants';
import context from '../../context';
import { useCursors } from '../../cursor/use-cursors';
import { usePipDecorate } from '../../decorates';
import { createCommentEditor, renderLeaf } from '../../extension';
import { PARAGRAPH, IMAGE, IMAGE_BLOCK } from '../../extension/constants';
import { generateEmptyElement, focusEditor } from '../../extension/core';
import RenderCommentEditorCustomRenderElement from '../../extension/render/render-comment-editor-element';
import CommentEditorToolbar from '../../extension/toolbar/comment-editor-toolbar';
import { useComment } from '../../hooks/use-comment';
import { ScrollContext } from '../../hooks/use-scroll-context';
import { EditorContainer } from '../../layout';
import withNodeId from '../../node-id';
import mdStringToSlate from '../../slate-convert/md-to-slate';
import slateToMdString from '../../slate-convert/slate-to-md';
import EventBus from '../../utils/event-bus';
import EventProxy from '../../utils/event-handler';

const getSubmitTip = (type, content) => {
  if (content) return 'Save';
  return type === 'comment' ? 'Comment' : 'Reply';
};

const DEFAULT_PLACEHOLDER = 'Enter_comment_shift_enter_for_new_line_Enter_to_send';

const CommentEditor = ({
  type,
  className,
  content,
  commentContent,
  placeholder = DEFAULT_PLACEHOLDER,
  insertContent,
  updateContent,
  setIsEditing,
  hiddenComment,
  hiddenUserInfo,
  onContentChange,
  isContextComment,
  closeComment
}) => {
  const commentWrapperRef = useRef();
  const { t } = useTranslation('sdoc-editor');
  const { addParticipants } = useComment();
  const submitTip = useMemo(() => getSubmitTip(type, content), [content, type]);
  const userInfo = context.getUserInfo();

  const document = useMemo(() => {
    const cursor = {};
    let elements = null;
    elements = [generateEmptyElement(PARAGRAPH, { placeholder })];
    return { elements, cursor };
  }, [placeholder]);

  const [slateValue, setSlateValue] = useState(document.elements);
  const commentEditorContainerRef = useRef(null);

  const editor = useMemo(() => {
    const defaultEditor = createCommentEditor();
    const newEditor = withNodeId(defaultEditor);
    const { cursors } = document;
    newEditor.cursors = cursors || {};
    newEditor.width = COMMENT_EDITOR_EDIT_AREA_WIDTH; // default width
    newEditor.editorType = COMMENT_EDITOR;

    return newEditor;
  }, [document]);

  const { cursors } = useCursors(editor);
  const decorate = usePipDecorate(editor);
  // init eventHandler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const eventProxy = useMemo(() => new EventProxy(editor), []);

  const updateValue = useCallback((value) => {
    if (!value || value.trim() === '') return;
    if (!content) return insertContent(value);
    updateContent && updateContent(value);
  }, [content, insertContent, updateContent]);

  const onSubmit = useCallback((event) => {
    event && event.stopPropagation();
    const mdString = slateToMdString(editor.children);
    updateValue(mdString);
    addParticipants(userInfo.username);
    editor.children = [generateEmptyElement(PARAGRAPH, { placeholder })];
    Transforms.select(editor, Editor.start(editor, []));
    onContentChange && onContentChange(null);
    closeComment && closeComment();
  }, [editor, updateValue, addParticipants, userInfo.username, placeholder, onContentChange, closeComment]);

  const onSubmitByEnterKey = useCallback((event) => {
    if (!ReactEditor.isFocused(editor)) return;
    onSubmit(event);
  }, [editor, onSubmit]);

  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribePostComment = eventBus.subscribe(INTERNAL_EVENT.COMMENT_EDITOR_POST_COMMENT, onSubmitByEnterKey);

    return () => {
      unsubscribePostComment();
    };
  }, [onSubmitByEnterKey]);

  const onCancel = useCallback((event) => {
    event.stopPropagation();
    const { type: eventType, keyCode, target } = event;
    if (eventType === 'keydown' && keyCode !== KeyCodes.Esc) return;
    if (eventType === 'click') {
      const isSdocContentWrapper = target.classList.contains('sdoc-content-wrapper');
      const listContainer = window.document.querySelector('#global-comment-list-container');
      const resizeContainer = window.document.querySelector('.sdoc-comment-resize-handler');
      const isClickOnListContainer = listContainer && listContainer.contains(target);
      const isClickOnCommentEditorContainer = commentWrapperRef.current.contains(target);
      const isClickResizeContainer = resizeContainer && resizeContainer.contains(target);
      const isPreventCancel = isClickOnListContainer || isClickOnCommentEditorContainer || isClickResizeContainer || isSdocContentWrapper;
      if (isPreventCancel) return;
    }
    setIsEditing && setIsEditing(false);
    hiddenComment && hiddenComment(false);

    if (onContentChange) {
      if (editor.children.find(n => Node.string(n).trim())) {
        onContentChange(slateToMdString(editor.children));
      } else {
        onContentChange(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsEditing]);

  useEffect(() => {
    let children = mdStringToSlate(content);
    if (commentContent) {
      children = mdStringToSlate(commentContent);
    }
    editor.children = children;
    Transforms.select(editor, Editor.end(editor, []));
  }, [editor, content, commentContent]);

  // useMount: focus editor
  useEffect(() => {
    const [firstNode] = editor.children;
    if (firstNode) {
      const [firstNodeFirstChild] = firstNode.children;

      if (firstNodeFirstChild) {
        const endOfFirstNode = Editor.end(editor, [0, 0]);
        const range = {
          anchor: endOfFirstNode,
          focus: endOfFirstNode,
        };
        focusEditor(editor, range);
      }
      // Force refresh to fix comment list
      setSlateValue([...editor.children]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFocusEditor = (e) => {
    if (e.target === commentEditorContainerRef.current) {
      const focusPoint = Editor.end(editor, []);
      focusEditor(editor, focusPoint);
    }
  };

  const handleScrollIntoView = useCallback((editor, domRange) => {
    try {
      const { selection } = editor;
      // Do not scroll into view, when focus on image
      const [imageNodeEntry] = Editor.nodes(editor, {
        match: n => [IMAGE, IMAGE_BLOCK].includes(n.type),
        at: selection
      });
      if (imageNodeEntry) return;
      const focusedNode = Node.get(editor, selection.focus.path);
      const domNode = ReactEditor.toDOMNode(editor, focusedNode);
      if (!domNode) return;
      scrollIntoView(domNode, { 'scrollMode': 'if-needed' });
    } catch (error) {
      //
    }
  }, []);

  const onMouseDown = useCallback((event) => {
    if (event.button === 0) {
      // Compatible with the editor which unload table plugin
      editor.reSetTableSelectedRange && editor.reSetTableSelectedRange();
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.CANCEL_TABLE_SELECT_RANGE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = useCallback((event) => {
    if (isHotkey('enter', event)) {
      event.preventDefault();
      const eventBus = EventBus.getInstance();
      eventBus.dispatch(INTERNAL_EVENT.COMMENT_EDITOR_POST_COMMENT, event);
      return;
    }

    if (isHotkey('shift+enter', event)) {
      event.preventDefault();
      Editor.insertBreak(editor);
      return;
    }

    eventProxy.onKeyDown(event);

  }, [eventProxy, editor]);

  return (
    <div className={classNames('comment-editor-wrapper', className)} ref={commentWrapperRef}>
      {type === 'comment' && !hiddenUserInfo && (
        <div className="comment-editor-user-info">
          <div className="comment-editor-user-img">
            <img src={userInfo.avatar_url} alt="" height="100%" width="100%" />
          </div>
          <div className="comment-editor-user-name">{userInfo.name}</div>
        </div>
      )}
      <EditorContainer>
        <div className="comment-editor-content">
          <div ref={commentEditorContainerRef} className='article comment-editor' onClick={handleFocusEditor} >
            <ScrollContext.Provider value={{ scrollRef: commentEditorContainerRef }}>
              <Slate editor={editor} value={slateValue} onChange={setSlateValue}>
                <Editable
                  id='sdoc-editor'
                  scrollSelectionIntoView={handleScrollIntoView}
                  cursors={cursors}
                  renderElement={(props) => RenderCommentEditorCustomRenderElement({ ...props, commentType: type })}
                  renderLeaf={renderLeaf}
                  onMouseDown={onMouseDown}
                  decorate={decorate}
                  onCut={eventProxy.onCut}
                  onCopy={eventProxy.onCopy}
                  onCompositionStart={eventProxy.onCompositionStart}
                  onCompositionUpdate={eventProxy.onCompositionUpdate}
                  onCompositionEnd={eventProxy.onCompositionEnd}
                  onKeyDown={onKeyDown}
                  onBeforeInput={eventProxy.onBeforeInput}
                />
              </Slate>
            </ScrollContext.Provider>
          </div>
          <CommentEditorToolbar
            editor={editor}
            onSubmit={onSubmit}
            submitBtnText={t(submitTip)}
            onCancel={onCancel}
          />
        </div>
      </EditorContainer>

    </div>
  );
};

CommentEditor.propTypes = {
  comment: PropTypes.object,
  placeholder: PropTypes.string,
  globalComment: PropTypes.bool,
  hiddenUserInfo: PropTypes.bool,
  hiddenComment: PropTypes.func,
  insertComment: PropTypes.func,
  updateComment: PropTypes.func,
  onContentChange: PropTypes.func,
};

export default CommentEditor;
