import { createEditor } from '@seafile/slate';
import { withHistory } from '@seafile/slate-history';
import { withReact } from '@seafile/slate-react';
import { CommentPlugins } from './plugins';
import renderLeaf from './render/render-leaf';

export const createCommentEditor = () => {
  const defaultEditor = CommentPlugins?.reduce((editor, pluginItem) => {
    const withPlugin = pluginItem.editorPlugin;
    if (withPlugin) {
      return withPlugin(editor);
    }
    return editor;
  }, withHistory(withReact(createEditor())));

  return defaultEditor;
};

export {
  renderLeaf,
};
