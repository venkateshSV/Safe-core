import React, { Component } from 'react'
import {BrowserRouter as Router, Route, Routes, BrowserRouter} from 'react-router-dom'
import SafeProvider from '@safe-global/safe-apps-react-sdk';
import Home from './components/Home';
import ConnectWallet from './components/ConnectWallet';
import Transactions from './components/Transactions';

export class App extends Component {
  render() {
    return (
      <div className='App'>
          <h1>Safe-Core App</h1>
          <BrowserRouter>
            <Routes>
              <Route exact path='/' element = {<ConnectWallet />} />
              <Route exact path='/home' element = {<Home />} />
              <Route exact path='/transaction' element={<Transactions />}/>
            </Routes>
          </BrowserRouter>
      </div>
      
    );
  }
}

export default App