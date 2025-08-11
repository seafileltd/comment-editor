import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CommentProvider, context, CommentEditor } from '@/basic-sdk';
import ErrorBoundary from '../components/error-boundary';

const SeafileCommentEditor = ({
  // Provider
  type, // comment or replay
  userInfo,
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
  closePanel,
  addParticipants,

  // api
  api,
}) => {
  context.init(api);


  return (
    <ErrorBoundary>
      <CommentProvider
        type={type}
        userInfo={userInfo}
        className={className}
        pluginName={pluginName}
        pluginEventBus={pluginEventBus}
        pluginEvent={pluginEvent}
      >
        <CommentEditor
          content={content}
          insertContent={insertContent}
          onContentChange={onContentChange}

          hiddenUserInfo={hiddenUserInfo}
          hiddenComment={hiddenComment}
          closePanel={closePanel}
          addParticipants={addParticipants}
        />
      </CommentProvider>
    </ErrorBoundary>
  );
};

SeafileCommentEditor.propTypes = {
  className: PropTypes.string,
  pluginName: PropTypes.string,
};

export default withTranslation('sdoc-editor')(SeafileCommentEditor);
