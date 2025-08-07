
import FileLoading from './components/file-loading';
import Loading from './components/loading';
import toaster from './components/toast';
import Tooltip from './components/tooltip';
import { INTERNAL_EVENT, FULL_WIDTH_MODE } from './constants';
import context from './context';
import CommentEditor from './editor/comment-editor';
import { createDefaultEditor, createCommentEditor } from './extension';
import DropdownMenuItem from './extension/commons/dropdown-menu-item';
import MenuShortcutPrompt from './extension/commons/menu-shortcut-indicator';
import { CommentProvider, useComment } from './hooks/use-comment';
import withNodeId from './node-id';
import { mdStringToSlate, slateToMdString, deserializeHtml, processor } from './slate-convert';
import { isMac, isMobile } from './utils/common-utils';
import EventBus from './utils/event-bus';
import LocalStorage from './utils/local-storage-utils';
import { getRebase } from './utils/rebase';


export {
  // comment
  CommentProvider,
  useComment,
  createDefaultEditor,
  createCommentEditor,
  CommentEditor,

  // component
  Loading,
  toaster,
  Tooltip,
  FileLoading,
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
  isMobile,
  LocalStorage,
  context,
  getRebase,
  FULL_WIDTH_MODE,
  withNodeId,
};
