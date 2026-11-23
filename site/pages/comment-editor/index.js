import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { commentProcessor, SeafileCommentEditor } from '../../../src';
import SdocContext from '../../context';
import FileCommentContext from '../../file-comment-context';

import './style.css';

const renderComment = (comment) => ({
  id: comment.id,
  author: comment.user_name || comment.author_name || comment.author,
  createdAt: (comment.created_at || comment.updated_at)?.replace(' ', 'T'),
  html: String(commentProcessor.processSync(comment.comment || '')),
});

const CommentEditorPage = ({ scenario }) => {
  const isSdoc = scenario === 'sdoc';
  const [api] = useState(() => isSdoc ? new SdocContext() : new FileCommentContext());
  const title = isSdoc ? 'SDoc Comment' : 'MD Comment';
  const filePath = isSdoc ? api.settings.docPath : api.settings.filePath;
  const configuredName = isSdoc ? api.settings.docName : api.settings.fileName;
  const fileName = configuredName || filePath?.split('/').pop() || (isSdoc ? '示例.sdoc' : '普通文件');
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState('');
  const submittingRef = useRef(false);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const result = await api.listComments();
      const loadedComments = result.map(renderComment);
      const loadedIds = new Set(loadedComments.map(comment => comment.id));
      setComments(currentComments => [...loadedComments, ...currentComments.filter(comment => !loadedIds.has(comment.id))]);
    } catch (error) {
      setLoadError(`加载评论失败：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const insertComment = async (content) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setDraft(content);
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const comment = await api.insertComment(content);
      setComments(previousComments => [...previousComments.filter(item => item.id !== comment.id), renderComment(comment)]);
      setDraft('');
    } catch (error) {
      setSubmitError(`提交失败，草稿已保留：${error.message}`);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comment-demo-page">
      <header className="comment-demo-header">
        <h1>{title}</h1>
        <nav aria-label="接入场景">
          <Link to="/sdoc-comment-editor" aria-current={isSdoc ? 'page' : undefined}>SDoc Comment</Link>
          <Link to="/md-comment-editor" aria-current={!isSdoc ? 'page' : undefined}>MD Comment</Link>
          <Link to="/">返回首页</Link>
        </nav>
      </header>
      <div className="comment-demo-workspace">
        <main className="comment-demo-main">
          <section className="comment-demo-sheet" aria-labelledby="comment-demo-editor-title">
            <h2 id="comment-demo-editor-title">撰写评论</h2>
            <p className="comment-demo-file">当前文件：{fileName}</p>
            <p className="comment-demo-hint">Enter 提交，Shift + Enter 换行</p>
            {submitError && <p role="alert">{submitError}</p>}
            {isSubmitting ? (
              <div>
                <p role="status">正在提交评论…</p>
                <div className="comment-demo-content" dangerouslySetInnerHTML={{ __html: String(commentProcessor.processSync(draft)) }} />
              </div>
            ) : (
              <SeafileCommentEditor
                pluginName={scenario}
                type="comment"
                hiddenUserInfo={true}
                placeholder="输入评论…"
                insertContent={insertComment}
                api={api}
                content={draft}
                settings={api.settings}
              />
            )}
          </section>
        </main>
        <aside className="comment-demo-sidebar" aria-labelledby="comment-demo-list-title">
          <div className="comment-demo-sidebar-header">
            <h2 id="comment-demo-list-title">评论</h2>
            <span className="comment-demo-count" aria-label="评论数量">{comments.length}</span>
          </div>
          <div id="global-comment-list-container" className="comment-demo-comments">
            {isLoading && <p className="comment-demo-empty" role="status">正在加载评论…</p>}
            {loadError && (
              <div role="alert">
                <p>{loadError}</p>
                <button type="button" onClick={loadComments} disabled={isLoading}>重试</button>
              </div>
            )}
            {!isLoading && !loadError && comments.length === 0 ? (
              <p className="comment-demo-empty">暂无评论，提交后将在这里显示</p>
            ) : (
              <ol className="comment-demo-list">
                {comments.map(comment => (
                  <li key={comment.id} className="comment-demo-item">
                    <div className="comment-demo-author">{comment.author}</div>
                    <time dateTime={comment.createdAt}>
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                    <div className="comment-demo-content" dangerouslySetInnerHTML={{ __html: comment.html }} />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

CommentEditorPage.propTypes = {
  scenario: PropTypes.oneOf(['sdoc', 'md']).isRequired,
};

export default CommentEditorPage;
