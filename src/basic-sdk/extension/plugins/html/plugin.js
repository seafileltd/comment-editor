import { deserializeHtml } from './helper';

const withHtml = (editor) => {
  const { insertData } = editor;
  const newEditor = editor;

  newEditor.insertData = (data) => {
    if (!newEditor.insertFragmentData(data)) {

      const htmlContent = data.getData('text/html') || '';
      if (htmlContent) {
        const content = deserializeHtml(htmlContent);
        editor.insertFragment(content);
        return;
      }

      insertData(data);
    }
  };

  return newEditor;

};

export default withHtml;
