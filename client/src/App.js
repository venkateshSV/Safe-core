import React, { Component } from 'react'
import {BrowserRouter as Router, Route, Routes, BrowserRouter} from 'react-router-dom'

import Home from './components/Home';
import ConnectWallet from './components/ConnectWallet';

export class App extends Component {
  render() {
    return (
      <div className='App'>
        <h1>Safe-Core App</h1>
        <BrowserRouter>
          <Routes>
            <Route exact path='/' element = {<ConnectWallet />} />
            <Route exact path='/home' element = {<Home />} />
          </Routes>
        </BrowserRouter>
      </div>
      
    );
  }
}

export default App