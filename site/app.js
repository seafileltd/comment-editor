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
      api: {}
    };
  }

  render() {
    const { isLoading } = this.state;
    if (isLoading) return <Loading />;

    return (
      <Routes primary={false} style={{ display: 'flex', width: '100%', height: '100%' }}>
        <Route path='/' element={<Home />}/>
        <Route path='/sdoc-editor' element={(
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div style={{ background: '#f5f5f5', width: '70%' }}></div>
            <div style={{ marginTop: '16px', padding: '0 16px', flex: 1 }}>
              <SeafileCommentEditor {...this.commentEditorProps} />
            </div>
          </div>
        )}/>
      </Routes>
    );
  }
}

export default App;
