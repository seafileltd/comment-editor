import React from 'react';
import { Routes, Route } from 'react-router-dom';
// import { SeafileCommentEditor } from '@seafile/comment-editor';
import { SeafileCommentEditor } from '../src/index';
import Loading from './commons/loading';
import context from './context';
import Home from './pages/home';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      displayComment: true,
    };
  }

  async componentDidMount() {
    await context.initApi();
    this.setState({ isLoading: false });

    this.commentEditorProps = {
      pluginName: 'sdoc',
      className: 'custom-editor-wrapper',

      type: 'comment',
      commentContent: '',
      hiddenUserInfo: true,
      insertContent: () => {},
      hiddenComment: () => {},
      onContentChange: () => {},

      api: {
        // comment
        updateComment: context.updateComment,
        deleteComment: context.deleteComment,
        listComments: context.listComments,
        insertComment: context.insertComment,
        insertReply: context.insertReply,
        deleteReply: context.deleteReply,
        updateReply: context.updateReply,

        // notifications
        readAllNotifications: context.readAllNotifications,
        listUnseenNotifications: context.listUnseenNotifications,
        deleteUnseenNotifications: context.deleteUnseenNotifications,

        // participants
        listParticipants: context.listParticipants,
        addParticipants: context.addParticipants,
        deleteParticipants: context.deleteParticipants,

        // collaborators
        listRelatedUsers: context.listRelatedUsers
      }
    };
  }

  render() {
    const { isLoading, displayComment } = this.state;
    if (isLoading) return <Loading />;

    return (
      <Routes primary={false} style={{ display: 'flex', width: '100%', height: '100%' }}>
        <Route path='/' element={<Home />}/>
        <Route path='/sdoc-editor' element={(
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div style={{ background: '#f5f5f5', width: '100%', display: 'flex', justifyContent: 'end' }}>
              <i className='sdocfont sdoc-comments' style={{ marginRight: '20px' }} onClick={() => {
                this.setState({ displayComment: true });
              }}>
              </i>
            </div>
            {displayComment && <SeafileCommentEditor {...this.commentEditorProps} />}
          </div>
        )}/>
      </Routes>
    );
  }
}

export default App;
