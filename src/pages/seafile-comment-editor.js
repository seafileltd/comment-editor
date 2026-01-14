import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CommentProvider, context, CommentEditor } from '@/basic-sdk';

const SeafileCommentEditor = ({
  // Provider
  type, // comment or replay
  placeholder,
  className = '',
  pluginName = '', // sdoc or dtable or txt or py ...
  pluginEventBus,
  pluginEvent,

  // Comment editor
  content,
  insertContent,
  onContentChange,

  hiddenUserInfo,
  hiddenComment,
  toolMenus,
  closePanel,

  collaborators,
  participants,
  addParticipants,

  // settings
  settings,
  api,
}) => {

  useEffect(() => {
    context.init(settings, api);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CommentProvider
      type={type}
      className={className}
      pluginName={pluginName}
      pluginEventBus={pluginEventBus}
      pluginEvent={pluginEvent}
      collaborators={collaborators}
      participants={participants}
      addParticipants={addParticipants}
    >
      <CommentEditor
        content={content}
        placeholder={placeholder}
        toolMenus={toolMenus}
        insertContent={insertContent}
        onContentChange={onContentChange}

        hiddenComment={hiddenComment}
        hiddenUserInfo={hiddenUserInfo}
        closePanel={closePanel}
      />
    </CommentProvider>
  )
};

SeafileCommentEditor.propTypes = {
  // Provider
  type: PropTypes.string, // comment or replay
  placeholder: PropTypes.string,
  className: PropTypes.string,
  pluginName: PropTypes.string, // sdoc or dtable or txt or py ...
  pluginEventBus: PropTypes.object,
  pluginEvent: PropTypes.object,

  // Comment editor
  content: PropTypes.any,
  insertContent: PropTypes.func,
  onContentChange: PropTypes.func,

  hiddenUserInfo: PropTypes.bool,
  hiddenComment: PropTypes.func,
  toolMenus: PropTypes.array,
  closePanel: PropTypes.func,

  collaborators: PropTypes.array,
  participants: PropTypes.array,
  addParticipants: PropTypes.func,

  // settings
  settings: PropTypes.object,
  api: PropTypes.object,
};

export default SeafileCommentEditor;
