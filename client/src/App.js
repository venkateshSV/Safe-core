import React, { Component,useLayoutEffect } from 'react'
import {BrowserRouter as Router, Route, Routes, BrowserRouter} from 'react-router-dom'
import Home from './components/Home';
import ConnectWallet from './components/ConnectWallet';
import Transactions from './components/Transactions';
import Header from './components/Header';
import Settings from './components/Settings';
import Assets from './components/Assets';
import Dashboard from './components/Dashboard';


export class App extends Component {
  render() {
    return (
      <div className='App'>
          {/* <ConnectWallet /> */}
          <div>
            <Header />
          </div>
          <BrowserRouter>
            <Routes>
              <Route exact path='/welcome' element = {<ConnectWallet />} />
              <Route exact path='/home' element = {<Dashboard />} />
              <Route exact path='/transaction' element={<Transactions />}/>
              <Route exact path='/balances' element={<Assets />}/>
              <Route exact path='/settings' element={<Settings />}/>
            </Routes>
          </BrowserRouter>
      </div>
      
    );
  }
}

export default App