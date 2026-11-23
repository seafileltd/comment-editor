import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Loading from './commons/loading';
import CommentEditorPage from './pages/comment-editor';
import Home from './pages/home';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: false });
  }

  render() {
    const { isLoading } = this.state;
    if (isLoading) return <Loading />;

    return (
      <Routes primary={false} style={{ display: 'flex', width: '100%', height: '100%' }}>
        <Route path='/' element={<Home />}/>
        <Route path='/sdoc-comment-editor' element={<CommentEditorPage key="sdoc" scenario="sdoc" />}/>
        <Route path='/md-comment-editor' element={<CommentEditorPage key="md" scenario="md" />}/>
      </Routes>
    );
  }
}

export default App;
