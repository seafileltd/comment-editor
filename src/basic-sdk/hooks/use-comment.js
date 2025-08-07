import React, { useContext, useEffect, useState, useReducer, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const CommentContext = React.createContext(null);

export const CommentProvider = ({
  children,
  pluginName = '',
  className = '',
  pluginEventBus,
  pluginEvent,
  api,
}) => {
  const { t } = useTranslation('sdoc-editor');
  const [collaborators, setCollaborators] = useState([]);

  // Mount
  useEffect(() => {

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CommentContext.Provider value={{
      pluginName, className,
      api, pluginEventBus, pluginEvent,
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
