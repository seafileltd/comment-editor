import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CommentProvider, context, CommentEditor } from '@/basic-sdk';
import ErrorBoundary from '../components/error-boundary';

const SeafileCommentEditor = ({
  pluginName = '',
  className = '',

  type,
  commentContent,
  hiddenUserInfo,
  insertContent,
  hiddenComment,
  onContentChange,

  pluginEventBus,
  pluginEvent,
  api,
}) => {
  context.init();


  return (
    <ErrorBoundary>
      <CommentProvider
        pluginName={pluginName}
        className={className}
        pluginEventBus={pluginEventBus}
        pluginEvent={pluginEvent}
        api={api}
      >
        <CommentEditor
          type={type}
          commentContent={commentContent}
          hiddenUserInfo={hiddenUserInfo}
          insertContent={insertContent}
          hiddenComment={hiddenComment}
          onContentChange={onContentChange}
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
