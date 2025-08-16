
import Loading from './components/loading';
import toaster from './components/toast';
import Tooltip from './components/tooltip';
import { INTERNAL_EVENT } from './constants';
import context from './context';
import CommentEditor from './editor/comment-editor';
import { createCommentEditor } from './extension';
import DropdownMenuItem from './extension/commons/dropdown-menu-item';
import MenuShortcutPrompt from './extension/commons/menu-shortcut-indicator';
import { CommentProvider, useComment } from './hooks/use-comment';
import withNodeId from './node-id';
import { mdStringToSlate, slateToMdString, deserializeHtml, processor } from './slate-convert';
import { isMac } from './utils/common-utils';
import EventBus from './utils/event-bus';
import LocalStorage from './utils/local-storage-utils';


export {
  // comment
  CommentProvider,
  useComment,
  createCommentEditor,
  CommentEditor,

  // component
  Loading,
  toaster,
  Tooltip,
  MenuShortcutPrompt,
  DropdownMenuItem,

  // event
  EventBus,
  INTERNAL_EVENT,

  // utils
  mdStringToSlate,
  slateToMdString,
  processor, // md string to html
  deserializeHtml, // html -> slate notes
  isMac,
  LocalStorage,
  context,
  withNodeId,
};
