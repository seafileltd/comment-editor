import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import PostCommentBtn from '../../src/basic-sdk/extension/toolbar/comment-editor-toolbar/post-comment';

jest.mock('../../src/basic-sdk/components/tooltip', () => () => null);

it('disables empty comments, enables text, and disables again when cleared', () => {
  const previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.body.appendChild(document.createElement('div'));
  const root = createRoot(container);
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  const render = (text) => act(() => root.render(
    <PostCommentBtn
      editor={{ children: [{ type: 'paragraph', children: [{ text }] }] }}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitBtnText="Comment"
    />
  ));
  const disabled = () => container.querySelector('[role="button"]').getAttribute('aria-disabled');
  const click = () => act(() => container.querySelector('.sdoc-comment-btn').click());

  try {
    ['', '\u200b', '\u200c', '\u200d', '\u200e', '\u200f', '\u2060', '\u034f', '\ufe0f'].forEach((text) => {
      render(text);
      expect(disabled()).toBe('true');
      click();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    render('می\u200cخواهم 👩\u200d💻');
    expect(disabled()).toBe('false');
    click();
    expect(onSubmit).toHaveBeenCalledTimes(1);

    render('');
    expect(disabled()).toBe('true');
    click();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  } finally {
    act(() => root.unmount());
    container.remove();
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
