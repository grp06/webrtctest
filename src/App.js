import React, { Component } from 'react';
import Video from './components/video'
import './App.css';
import './styles/video.css'
import { BrowserRouter, Route } from 'react-router-dom';
import { goToRoomInput } from './components/goToRoomInput';
import Home from './components/Home'
class App extends Component {
  render() {
    return (
      <BrowserRouter>
       <React.Fragment>
          <Route path="/" exact component={Home}/>
          <Route path="/:roomId" exact component={Video}/>
        </React.Fragment>
      </BrowserRouter>
    )
  }
}

export default App;
