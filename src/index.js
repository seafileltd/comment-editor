import { EventBus, createCommentEditor, withNodeId } from '@/basic-sdk';
import { EXTERNAL_EVENT } from './constants';
import SeafileCommentEditor from './pages/seafile-comment-editor';

export {
  SeafileCommentEditor,
  createCommentEditor,
  EventBus,
  EXTERNAL_EVENT,
  withNodeId
};
