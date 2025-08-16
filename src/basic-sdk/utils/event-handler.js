import isHotkey from 'is-hotkey';
import { ELEMENT_TYPE } from '../extension/constants';
import { getSelectedNodeByType } from '../extension/core/queries/';
import { setOriginSdocKey } from './document-utils';

class EventProxy {

  constructor(editor) {
    this.editor = editor;
  }

  onKeyDown = (event) => {
    const editor = this.editor;

    if (editor.onHotKeyDown) {
      const isHandled = editor.onHotKeyDown(event);
      if (isHandled) return;
    }

    // bold
    if (isHotkey('mod+b', event)) {
      event.preventDefault();
      editor.toggleTextBold();
    }

    // italic
    if (isHotkey('mod+i', event)) {
      event.preventDefault();
      editor.toggleTextItalic();
    }

    // font scale
    if (isHotkey('opt+.', event)) {
      event.preventDefault();
      editor.increaseFontSize();
    }

    if (isHotkey('opt+,', event)) {
      event.preventDefault();
      editor.reduceFontSize();
    }

    // disable the default 'save page'
    if (isHotkey('mod+s', event)) {
      event.preventDefault();
    }

    // redo
    if (isHotkey('mod+y', event)) {
      event.preventDefault();
      const { history } = editor;
      if (history.redos.length === 0) {
        return false;
      }
      editor.redo();
    }

    // undo
    if (isHotkey('mod+z', event)) {
      event.preventDefault();
      const { history } = editor;
      if (history.undos.length === 0) {
        return false;
      }
      editor.undo();
    }

    if (isHotkey('tab', event) || isHotkey('shift+tab', event)) {
      editor.handleTab && editor.handleTab(event);
    }

    const node = getSelectedNodeByType(editor, ELEMENT_TYPE.TABLE);
    if (node) {
      this.editor.tableOnKeyDown(event);
    }

    const imageNode = getSelectedNodeByType(editor, ELEMENT_TYPE.IMAGE);
    if (imageNode) {
      this.editor.imageOnKeyDown(event);
    }
  };

  onCopy = (event) => {
    if (this.editor.onCopy) this.editor.onCopy(event);
    setOriginSdocKey(event);
  };

  onCut = (event) => {
    setOriginSdocKey(event);
    if (this.editor.cut) {
      this.editor.cut(event);
    }
  };

  onPaste = (event) => {

  };

  onCompositionStart = (event) => {
    const editor = this.editor;
    if (editor.onCompositionStart) {
      const isHandled = editor.onCompositionStart(event);
      if (isHandled) return;
    }
  };
  onCompositionUpdate = (event) => {
    const editor = this.editor;
    if (editor.onCompositionUpdate) {
      const isHandled = editor.onCompositionUpdate(event);
      if (isHandled) return;
    }
  };

  onCompositionEnd = (event) => {
    const editor = this.editor;
    if (editor.onCompositionEnd) {
      const isHandled = editor.onCompositionEnd(event);
      if (isHandled) return;
    }
  };

}

export default EventProxy;
