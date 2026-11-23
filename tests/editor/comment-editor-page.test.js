import React, { act } from 'react';
import { initReactI18next } from 'react-i18next';
import { Editor, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import i18n from 'i18next';
import { createRoot } from 'react-dom/client';
import { SeafileAPI as SeafileClient } from 'seafile-js';
import SeafileAPI from '../../site/api/seafile-api';
import Context from '../../site/context';
import FileCommentContext from '../../site/file-comment-context';
import CommentEditorPage from '../../site/pages/comment-editor';
import { generateImageInfos, insertImage } from '../../src/basic-sdk/extension/plugins/image/helpers';

let mockEditor;

jest.mock('@seafile/slate-react', () => {
  const React = require('react');
  const actual = jest.requireActual('@seafile/slate-react');
  return {
    ...actual,
    Slate: (props) => {
      mockEditor = props.editor;
      return React.createElement(actual.Slate, props);
    },
  };
});

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock('../../src/basic-sdk/components/tooltip', () => () => null);

describe.each(['sdoc', 'md'])('%s comment editor demo page', (scenario) => {
  let container;
  let root;
  let previousSettings;
  let previousActEnvironment;
  let listComments;
  let insertComment;

  beforeAll(async () => {
    await i18n.use(initReactI18next).init({
      lng: 'en',
      resources: { en: { 'comment-editor': {} } },
    });
  });

  beforeEach(async () => {
    previousSettings = window.seafileConfig;
    previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
    window.seafileConfig = {
      name: '测试用户', username: 'test@example.com', serviceUrl: 'https://seafile.example.com',
      assetsUrl: '/assets/', accessToken: 'document-token',
      sdocServer: 'https://sdoc.example.com',
      docName: '文档显示名.sdoc', docPath: '/docs/example.sdoc', docUuid: 'doc-uuid',
      apiToken: 'user-token', repoID: 'file-repo', fileName: '文件显示名.txt', filePath: '/docs/example.txt',
    };
    let nextId = 1;
    const PageContext = scenario === 'md' ? FileCommentContext : Context;
    listComments = jest.spyOn(PageContext.prototype, 'listComments').mockResolvedValue([]);
    insertComment = jest.spyOn(PageContext.prototype, 'insertComment').mockImplementation(comment => Promise.resolve({
      comment, id: nextId++, user_name: '测试用户', created_at: '2026-11-21T10:00:00Z',
    }));
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.body.appendChild(document.createElement('div'));
    root = createRoot(container);
    await act(async () => root.render(<CommentEditorPage scenario={scenario} />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    window.seafileConfig = previousSettings;
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    jest.restoreAllMocks();
  });

  const typeText = async (text) => {
    await act(async () => mockEditor.insertText(text));
  };

  const submit = async () => {
    await act(async () => container.querySelector('.sdoc-comment-btn').click());
  };

  const getComments = () => container.querySelectorAll('.comment-demo-list > li');

  const remount = async () => {
    act(() => root.unmount());
    root = createRoot(container);
    await act(async () => root.render(<CommentEditorPage scenario={scenario} />));
  };

  it('places the editor in the main area and shows an empty comments sidebar', () => {
    expect(container.querySelector('main #comment-editor')).not.toBeNull();
    expect(container.querySelector('aside #global-comment-list-container')).not.toBeNull();
    expect(container.querySelector('aside').textContent).toContain('暂无评论');
    expect(container.querySelector('[aria-label="评论数量"]').textContent).toBe('0');
    expect(listComments).toHaveBeenCalledTimes(1);
    expect(container.querySelector('h1').textContent).toContain(scenario === 'md' ? 'MD Comment' : 'SDoc Comment');
    expect(container.querySelector('.comment-demo-file').textContent).toContain(scenario === 'md' ? '文件显示名.txt' : '文档显示名.sdoc');
    expect(container.querySelector('[aria-current="page"]').getAttribute('href')).toBe(`/${scenario}-comment-editor`);
  });

  it('uses the path basename when the configured name is missing', async () => {
    delete window.seafileConfig.docName;
    delete window.seafileConfig.fileName;
    await remount();

    expect(container.querySelector('.comment-demo-file').textContent).toContain(scenario === 'md' ? 'example.txt' : 'example.sdoc');
  });

  it('does not add an empty comment', async () => {
    await submit();
    expect(getComments()).toHaveLength(0);
    expect(container.querySelector('[aria-label="评论数量"]').textContent).toBe('0');
    expect(insertComment).not.toHaveBeenCalled();
  });

  it('renders submitted rich text with author and time, then clears the input', async () => {
    await act(async () => {
      Transforms.select(mockEditor, Editor.start(mockEditor, []));
      Editor.addMark(mockEditor, 'bold', true);
    });
    await typeText('第一条评论');
    await submit();

    expect(getComments()).toHaveLength(1);
    const comment = getComments()[0];
    expect(comment.querySelector('strong').textContent).toBe('第一条评论');
    expect(comment.querySelector('.comment-demo-author').textContent).toBe('测试用户');
    expect(comment.querySelector('time').dateTime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(container.querySelector('[aria-label="评论数量"]').textContent).toBe('1');
    expect(container.querySelector('.comment-demo-empty')).toBeNull();
    expect(Editor.string(mockEditor, [])).toBe('');
    expect(container.querySelector('#comment-editor-comment-btn').getAttribute('aria-disabled')).toBe('true');
    expect(insertComment).toHaveBeenCalledWith(expect.stringContaining('第一条评论'));
  });

  it('loads persisted comments when the page is reopened', async () => {
    listComments.mockResolvedValue([{
      id: 42, comment: '**已保存评论**', author: 'author@example.com',
      user_name: '服务端作者', updated_at: '2026-11-21 18:30:00',
    }]);
    await remount();

    expect(getComments()).toHaveLength(1);
    expect(getComments()[0].querySelector('strong').textContent).toBe('已保存评论');
    expect(getComments()[0].querySelector('.comment-demo-author').textContent).toBe('服务端作者');
    expect(getComments()[0].querySelector('time').textContent).not.toContain('Invalid');
  });

  it('keeps the draft visible while submitting and adds it only after server success', async () => {
    let complete;
    insertComment.mockReturnValueOnce(new Promise(resolve => {
      complete = resolve;
    }));
    await typeText('等待保存');
    await submit();

    expect(container.querySelector('[role="status"]').textContent).toContain('正在提交');
    expect(container.querySelector('main').textContent).toContain('等待保存');
    expect(container.querySelector('.sdoc-comment-btn')).toBeNull();
    expect(getComments()).toHaveLength(0);
    await act(async () => complete({ id: 43, comment: '等待保存', user_name: '服务端作者' }));
    expect(getComments()).toHaveLength(1);
    expect(getComments()[0].textContent).toContain('等待保存');
    expect(getComments()[0].textContent).toContain('服务端作者');
    expect(Editor.string(mockEditor, [])).toBe('');
  });

  it('restores the draft after a submission fails and allows retry', async () => {
    insertComment.mockRejectedValueOnce(new Error('Network Error'));
    await typeText('不能丢失的草稿');
    await submit();

    expect(getComments()).toHaveLength(0);
    expect(container.querySelector('[role="alert"]').textContent).toContain('草稿已保留');
    expect(Editor.string(mockEditor, [])).toBe('不能丢失的草稿');
    await submit();
    expect(getComments()).toHaveLength(1);
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(insertComment).toHaveBeenCalledTimes(2);
  });

  it('shows a failed list request and retries it', async () => {
    listComments.mockRejectedValueOnce(new Error('Network Error'));
    await remount();
    expect(container.querySelector('aside [role="alert"]').textContent).toContain('加载评论失败');
    expect(container.querySelector('.comment-demo-empty')).toBeNull();

    await act(async () => container.querySelector('aside button').click());
    expect(container.querySelector('aside [role="alert"]')).toBeNull();
    expect(container.querySelector('.comment-demo-empty').textContent).toContain('暂无评论');
  });

  it('preserves a newly saved comment when an earlier list request finishes later', async () => {
    let complete;
    listComments.mockReturnValueOnce(new Promise(resolve => {
      complete = resolve;
    }));
    await remount();
    await typeText('新提交评论');
    await submit();
    expect(getComments()).toHaveLength(1);

    await act(async () => complete([]));
    expect(getComments()).toHaveLength(1);
    expect(getComments()[0].textContent).toContain('新提交评论');
  });

  it('does not duplicate a saved comment already returned by the list request', async () => {
    let completeList;
    let completeInsert;
    listComments.mockReturnValueOnce(new Promise(resolve => {
      completeList = resolve;
    }));
    insertComment.mockReturnValueOnce(new Promise(resolve => {
      completeInsert = resolve;
    }));
    await remount();
    await typeText('仅显示一次');
    await submit();
    const comment = { id: 42, comment: '仅显示一次', updated_at: '2026-11-21 18:30:00' };
    await act(async () => completeList([comment]));
    await act(async () => completeInsert(comment));
    expect(getComments()).toHaveLength(1);
  });

  it('appends consecutive submissions and preserves earlier comments while typing', async () => {
    await typeText('第一条评论');
    await submit();
    await typeText('第二条评论');

    expect(getComments()).toHaveLength(1);
    expect(getComments()[0].textContent).toContain('第一条评论');
    expect(getComments()[0].textContent).not.toContain('第二条评论');

    await submit();
    expect(Array.from(getComments(), comment => comment.querySelector('.comment-demo-content').textContent.trim()))
      .toEqual(['第一条评论', '第二条评论']);
    expect(container.querySelector('[aria-label="评论数量"]').textContent).toBe('2');
  });

  it('inserts a new line with Shift+Enter and submits with Enter', async () => {
    const input = container.querySelector('#comment-editor');
    // jsdom omits the contenteditable property used by Slate's keyboard event guard.
    Object.defineProperty(input, 'isContentEditable', { value: true });
    const pressEnter = async (shiftKey = false) => {
      await act(async () => {
        ReactEditor.focus(mockEditor);
        input.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter', keyCode: 13, which: 13, shiftKey, bubbles: true, cancelable: true,
        }));
      });
    };

    await typeText('第一行');
    await pressEnter(true);
    expect(mockEditor.children).toHaveLength(2);
    await typeText('第二行');
    expect(getComments()).toHaveLength(0);

    await pressEnter();
    expect(getComments()).toHaveLength(1);
    expect(getComments()[0].querySelector('.comment-demo-content').textContent).toContain('第一行');
    expect(getComments()[0].querySelector('.comment-demo-content').textContent).toContain('第二行');
    expect(Editor.string(mockEditor, [])).toBe('');
  });

  describe('image uploads', () => {
    let previousCreateObjectURL;
    let upload;
    const imageUrl = scenario === 'md'
      ? 'https://seafile.example.com/lib/file-repo/file/images/auto-upload/uploaded.png?raw=1'
      : 'https://seafile.example.com/assets/images/uploaded.png';

    beforeEach(() => {
      jest.useFakeTimers();
      previousCreateObjectURL = Object.getOwnPropertyDescriptor(window.URL, 'createObjectURL');
      Object.defineProperty(window.URL, 'createObjectURL', {
        configurable: true,
        value: () => 'blob:http://localhost/test-image',
      });
      if (scenario === 'md') {
        jest.spyOn(SeafileClient.prototype, 'getFileServerUploadLink').mockResolvedValue({ data: 'https://files.example.com/upload' });
        upload = jest.spyOn(SeafileClient.prototype, 'uploadImage');
      } else {
        upload = jest.spyOn(SeafileAPI.prototype, 'uploadSdocImage');
      }
    });

    afterEach(async () => {
      await act(async () => jest.runOnlyPendingTimers());
      jest.useRealTimers();
      jest.restoreAllMocks();
      if (previousCreateObjectURL) {
        Object.defineProperty(window.URL, 'createObjectURL', previousCreateObjectURL);
      } else {
        delete window.URL.createObjectURL;
      }
    });

    const insertLocalImage = async (file) => {
      await act(async () => {
        Transforms.select(mockEditor, Editor.start(mockEditor, []));
        insertImage(mockEditor, generateImageInfos([file]), mockEditor.selection);
      });
      await act(async () => jest.runOnlyPendingTimers());
    };

    it('uploads an image and displays its complete URL in the submitted comment', async () => {
      upload.mockResolvedValue({ data: scenario === 'md' ? [{ name: 'uploaded.png' }] : { relative_path: ['images/uploaded.png'] } });
      const file = new File(['image content'], 'original.png', { type: 'image/png' });
      await insertLocalImage(file);

      if (scenario === 'md') {
        expect(upload).toHaveBeenCalledWith('https://files.example.com/upload?ret-json=1', expect.any(FormData));
      } else {
        expect(upload).toHaveBeenCalledWith('doc-uuid', [file]);
      }
      const image = container.querySelector('#comment-editor img');
      expect(image.getAttribute('src')).toBe(imageUrl);

      await submit();
      const submittedImage = container.querySelector('.comment-demo-content img');
      expect(submittedImage.getAttribute('src')).toBe(image.getAttribute('src'));
      expect(getComments()).toHaveLength(1);
    });

    it('shows the existing upload error state when the request fails', async () => {
      upload.mockRejectedValue(new Error('Upload failed'));
      const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
      const file = new File(['image content'], 'original.png', { type: 'image/png' });
      await insertLocalImage(file);

      expect(errorLog).toHaveBeenCalledWith('Upload failed');
      expect(container.querySelector('.sdoc-image-content.upload-error')).not.toBeNull();
      expect(container.querySelector('#comment-editor').textContent).toContain('Image_is_upload_error');
      expect(getComments()).toHaveLength(0);
    });
  });
});
