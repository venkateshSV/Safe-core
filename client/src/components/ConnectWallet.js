import React,{useState} from 'react'
import GetAllSafes from './GetAllSafes';
import { ethers, utils } from "ethers";



const ConnectWallet = () => {
  const [errorMessage, setErrorMessage] = useState(null);
	const [defaultAccount, setDefaultAccount] = useState(null);
	const [connButtonText, setConnButtonText] = useState('Connect Wallet');
  const connectWallet = async() =>{
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        console.log('MetaMask Here!');
  
        window.ethereum.request({ method: 'eth_requestAccounts'})
        .then(result => {
          accountChangedHandler(result[0]);
          setConnButtonText('Wallet Connected');
        })
        .catch(error => {
          setErrorMessage(error.message);
        
        });
      } else {
        console.log('Need to install MetaMask');
        setErrorMessage('Please install MetaMask browser extension to interact');
      }
    } catch (error) {
      console.log(error);
    }
  }
  const accountChangedHandler = (newAccount) => {
		const acc = ethers.utils.getAddress(newAccount);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(provider);
    const signer = provider.getSigner();
    console.log(10);
    console.log(signer);
    setDefaultAccount(acc);
	}


	const chainChangedHandler = () => {
		window.location.reload();
	}


	// listen for account changes
	window.ethereum.on('accountsChanged', accountChangedHandler);

	window.ethereum.on('chainChanged', chainChangedHandler);
  return (
    <div>
      <h1>{!defaultAccount? "Connect your wallet!" : <p>Your wallet address: {defaultAccount}</p>}</h1>
      <button style={{backgroundColor: '#008080',borderRadius: 10,color:'white', marginTop: 10,marginRight:10, fontSize: 20}}onClick={connectWallet}>Connect</button>
      <GetAllSafes walletAddress = {defaultAccount}/>
    </div>
  )
}

export default ConnectWallet

