import React, { useContext, useState } from 'react';

import '../assets/css/layout.css';
import '../assets/css/default.css';
import '../assets/css/sdoc-editor-article.css';
import '../assets/css/sdoc-editor-plugins.css';
import '../assets/css/sdoc-comment-editor-plugin.css';
import '../assets/css/dropdown-menu.css';

const CommentContext = React.createContext(null);

export const CommentProvider = ({
  children,
  type, // comment or replay
  userInfo,
  className = '',
  pluginName = '', // sdoc or wiki or txt ...
  pluginEventBus,
  pluginEvent,
}) => {
  const [collaborators, setCollaborators] = useState([]);

  return (
    <CommentContext.Provider value={{
      type, userInfo, className,
      pluginName, pluginEventBus, pluginEvent,
      collaborators,
    }}>
      {children}
    </CommentContext.Provider>
  );
};

export const useComment = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('\'CommentContext\' is null');
  }
  return { ...context };
};
