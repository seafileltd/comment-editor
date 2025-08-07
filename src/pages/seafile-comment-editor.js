import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { CommentProvider, context, CommentLayout } from '@/basic-sdk';
import ErrorBoundary from '../components/error-boundary';

const SeafileCommentEditor = ({
  editor,
  className = '',
  pluginName = '',
  api,
  onCloseCommentPanel,
}) => {
  context.init();


  return (
    <ErrorBoundary>
      <CommentProvider
        pluginName={pluginName}
        className={className}
        editor={editor}
        api={api}
        onCloseCommentPanel={onCloseCommentPanel}
      >
        <CommentLayout editor={editor} className={className} pluginName={pluginName} />
      </CommentProvider>
    </ErrorBoundary>
  );
};

SeafileCommentEditor.propTypes = {
  className: PropTypes.string,
  pluginName: PropTypes.string,
  t: PropTypes.func,
};

export default withTranslation('sdoc-editor')(SeafileCommentEditor);
