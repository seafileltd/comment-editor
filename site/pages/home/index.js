import React from 'react';
import { NavLink as Link } from 'react-router-dom';

import './style.css';

class Home extends React.Component {

  render() {
    return (
      <div className="app">
        <div className='header'>Comment Editor 测试页面</div>
        <div className='nav-container'>
          <Link to='/sdoc-editor'>Sdoc Editor</Link>
        </div>
        <div className='tip-message'>请点击上面链接，测试不同的编辑器功能</div>
      </div>
    );
  }
}

export default Home;
