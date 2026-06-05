import React, { useCallback, useContext } from 'react';
import context from '../context';
import { User } from '../model';

import '../assets/css/layout.css';
import '../assets/css/sdoc-editor-article.css';
import '../assets/css/sdoc-editor-plugins.css';
import '../assets/css/sdoc-comment-editor-plugin.css';
import '../assets/css/dropdown-menu.css';
import '../assets/css/popover.css';

const CommentContext = React.createContext(null);

export const CommentProvider = ({
  children,
  type, // comment or replay
  className = '',
  pluginName = '', // sdoc or wiki or txt ...
  pluginEventBus,
  pluginEvent,
  collaborators = [],
  participants = [],
  addParticipants
}) => {

  const getCollaborators = useCallback(() => {
    const newCollaborators = collaborators.map((user) => new User(user));
    return newCollaborators;
  }, [collaborators]);

  const getParticipants = useCallback(() => {
    const newParticipants = participants.map((user) => new User(user));
    return newParticipants;
  }, [participants]);

  return (
    <CommentContext.Provider value={{
      type, userInfo: context.getUserInfo(), className,
      pluginName, pluginEventBus, pluginEvent,
      collaborators: getCollaborators(), participants: getParticipants(), addParticipants,
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
