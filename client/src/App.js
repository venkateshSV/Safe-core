import React, { Component } from 'react'
import ConnectWallet from './components/ConnectWallet';

export class App extends Component {
  render() {
    return (
      <div className='App'>
        <h1>Safe-Core App</h1>
        <ConnectWallet></ConnectWallet>
      </div>
      
    );
  }
}

export default App