import React, { useContext, useEffect, useState, useReducer, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { COMMENT_TYPES, DOC_COMMENT_ELEMENT_ID, DOC_NOTIFICATION_REDUCER_TYPE } from '../comment/constants';
import { useCommentsMount } from '../comment/hooks/comment-hooks/use-comment-mount';
import { useNotificationsMount } from '../comment/hooks/notification-hooks';
import { commentReducer, initCommentsInfo } from '../comment/reducer/comment-reducer';
import { notificationReducer, initNotificationsInfo } from '../comment/reducer/notification-reducer';
import { generatorNotificationKey } from '../comment/utils';
import toaster from '../components/toast';
import { INTERNAL_EVENT } from '../constants';
import { User } from '../model';
import { getErrorMsg } from '../utils/common-utils';
import EventBus from '../utils/event-bus';

const CommentContext = React.createContext(null);

export const CommentProvider = ({
  editor,
  children,
  onCloseCommentPanel,
  api,
  pluginName,
  className,
}) => {
  const { t } = useTranslation('sdoc-editor');
  const [collaborators, setCollaborators] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [commentType, setCommentType] = useState(COMMENT_TYPES.ALL);
  const [commentList, setCommentList] = useState([]);

  const [commentsInfo, dispatch] = useReducer(commentReducer, initCommentsInfo);
  useCommentsMount(dispatch, api);
  const [notificationsInfo, notificationsDispatch] = useReducer(notificationReducer, initNotificationsInfo);
  useNotificationsMount(dispatch, api, collaborators);

  useEffect(() => {
    if (Object.keys(commentsInfo.element_comments_map).length) {
      editor.element_comments_map = commentsInfo.element_comments_map;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentsInfo.element_comments_map]);

  useEffect(() => {
    editor.notifications_map = { ...notificationsInfo.notifications_map };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationsInfo]);

  useEffect(() => {
    const { comment_list } = commentsInfo;
    if (commentType === COMMENT_TYPES.ALL) {
      const commentList = comment_list.map(item => {
        item.replies = item.replies.filter(reply => !['True', 'False'].includes(reply.reply));
        return item;
      });
      setCommentList(commentList);
    } else if (commentType === COMMENT_TYPES.RESOLVED) {
      const commentList = comment_list.filter(item => item.resolved);
      setCommentList(commentList);
    } else if (commentType === COMMENT_TYPES.UNRESOLVED) {
      const commentList = comment_list.filter(item => !item.resolved);
      setCommentList(commentList);
    } else if (commentType === COMMENT_TYPES.DOC) {
      const commentList = comment_list.filter(comment => comment.detail.element_id === DOC_COMMENT_ELEMENT_ID);
      setCommentList(commentList);
    }
  }, [commentType, commentsInfo]);

  // Participants
  const updateLocalParticipants = useCallback((added = []) => {
    if (!Array.isArray(added) || added.length === 0) return;
    let newParticipants = participants.slice(0);
    added.forEach(participant => {
      const newParticipant = new User(participant);
      if (!newParticipants.find(item => item.username === newParticipant.username)) {
        newParticipants.push(newParticipant);
      }
    });
    setParticipants(newParticipants);
  }, [participants]);

  const deleteLocalParticipant = useCallback((email) => {
    if (!participants.find((participant) => participant.username === email)) return;
    let newParticipants = participants.slice(0);
    newParticipants = newParticipants.filter((participant) => participant.username !== email);
    setParticipants(newParticipants);
  }, [participants]);

  const addParticipants = useCallback((otherEmail) => {
    if (participants.find(participant => participant.username === otherEmail)) return;
    api.addParticipants([otherEmail]).then(res => {
      const { success } = res.data;
      updateLocalParticipants(success);
    }).catch(error => {
      const errorMessage = getErrorMsg(error);
      toaster.danger(t(errorMessage));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateLocalParticipants, participants]);

  const deleteParticipant = useCallback((email) => {
    if (!participants.find(participant => participant.username === email)) return;
    api.deleteParticipants(email).then(res => {
      let newParticipants = participants.slice(0);
      newParticipants = newParticipants.filter(participant => participant.username !== email);
      setParticipants(newParticipants);
    }).catch(error => {
      const errorMessage = getErrorMsg(error);
      toaster.danger(t(errorMessage));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

  // Notifications
  const deleteUnseenNotifications = useCallback((comment) => {
    let unseenCommentIds = [];
    let unseenNotificationKeys = [];
    const commentNotificationKey = generatorNotificationKey(comment.id);
    const commentNotification = notificationsInfo.notifications_map[commentNotificationKey];
    if (commentNotification) {
      unseenNotificationKeys.push(commentNotification.key);
      unseenCommentIds.push(commentNotification.id);
    }
    Array.isArray(comment.replies) && comment.replies.forEach(reply => {
      const replyNotificationKey = generatorNotificationKey(reply.comment_id, reply.id);
      const replyNotification = notificationsInfo.notifications_map[replyNotificationKey];
      if (replyNotification) {
        unseenNotificationKeys.push(replyNotification.key);
        unseenCommentIds.push(replyNotification.id);
      }
    });
    api.deleteUnseenNotifications(unseenCommentIds).then(res => {
      notificationsDispatch({ type: DOC_NOTIFICATION_REDUCER_TYPE.DEL, payload: unseenNotificationKeys });
    }).catch((error) => {
      //
    });
  }, [api, notificationsInfo.notifications_map]);

  // Mount
  useEffect(() => {
    // get participants
    api.listParticipants().then(res => {
      const participants = res.data.participant_list;
      updateLocalParticipants(participants);
    }).catch(error => {
      console.log(error);
    });

    // get collaborators
    api.listRelatedUsers().then(res => {
      const collaborators = [];
      res.data.related_users.forEach((user) => {
        const collaborator = new User(user);
        collaborators.push(collaborator);
      });
      setCollaborators(collaborators);
    }).catch(error => {
      console.log(error);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listening
  useEffect(() => {
    const eventBus = EventBus.getInstance();
    const unsubscribeParticipantAdded = eventBus.subscribe(INTERNAL_EVENT.PARTICIPANT_ADDED, updateLocalParticipants);
    const unsubscribeParticipantRemoved = eventBus.subscribe(INTERNAL_EVENT.PARTICIPANT_REMOVED, deleteLocalParticipant);
    return () => {
      unsubscribeParticipantAdded();
      unsubscribeParticipantRemoved();
    };
  }, [updateLocalParticipants, deleteLocalParticipant]);

  return (
    <CommentContext.Provider value={{
      pluginName, className,
      api,
      commentsInfo, commentType, commentList, dispatch, setCommentType, onCloseCommentPanel,
      collaborators,
      notificationsInfo, deleteUnseenNotifications,
      addParticipants, deleteParticipant, participants
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
