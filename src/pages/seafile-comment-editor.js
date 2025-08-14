import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { CommentProvider, context, CommentEditor } from '@/basic-sdk';
import ErrorBoundary from '../components/error-boundary';

const SeafileCommentEditor = ({
  // Provider
  type, // comment or replay
  className = '',
  pluginName = '', // sdoc or wiki or txt ...
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
  context.init(settings, api);


  return (
    <Suspense>
      <ErrorBoundary>
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
            insertContent={insertContent}
            onContentChange={onContentChange}

            hiddenUserInfo={hiddenUserInfo}
            hiddenComment={hiddenComment}
            toolMenus={toolMenus}
            closePanel={closePanel}
            addParticipants={addParticipants}
          />
        </CommentProvider>
      </ErrorBoundary>
    </Suspense>
  );
};

SeafileCommentEditor.propTypes = {
  className: PropTypes.string,
  pluginName: PropTypes.string,
};

export default SeafileCommentEditor;
