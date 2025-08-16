export const setCursor = (editor, user, location, cursorData) => {
  const { username: clientId } = user;

  if (!editor.cursors) editor.cursors = {};

  if (location) {

    const oldCursor = editor.cursors[clientId] ? editor.cursors[clientId] : {};
    const newCursorData = { ...oldCursor, ...location, ...cursorData };
    editor.cursors[clientId] = newCursorData;
  } else {
    delete editor.cursors[clientId];
  }

  editor.cursors = { ...editor.cursors };
  return editor;
};
