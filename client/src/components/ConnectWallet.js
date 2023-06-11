import React,{useState,useEffect} from 'react'
import GetAllSafes from './GetAllSafes';
import { ethers, utils } from "ethers";


const ConnectWallet = () =>
{
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* MetaMask is installed */
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };
  return (
    <div >
      {/* <div style={{width:'100%',alignItems:'center',justifyContent:'space-evenly'}}>
        <div>
            <h1 style={{float:'left'}}> Safe &#123;WALLET&#125; </h1>
        </div>
        <div style={{float:'right'}}>
        <button style={{backgroundColor: '#008080',borderRadius: 10,color:'white', marginTop: 10,marginRight:10, fontSize: 20}}onClick={connectWallet}>
        <span>
          {walletAddress && walletAddress.length > 0
            ? `Connected: ${walletAddress.substring(
                0,
                6
              )}...${walletAddress.substring(38)}`
            : "Connect Wallet"}
        </span>
      </button>
      </div>
    </div> */}
      <GetAllSafes walletAddress = {walletAddress && walletAddress.length>0 ? ethers.utils.getAddress(walletAddress) : walletAddress}/>
    </div>

  )
}

export default ConnectWallet



// const ConnectWallet = () => {
//   const [errorMessage, setErrorMessage] = useState(null);
// 	const [defaultAccount, setDefaultAccount] = useState(null);
// 	const [connButtonText, setConnButtonText] = useState('Connect Wallet');

//   const connectWallet = () =>{
//     if (window.ethereum && window.ethereum.isMetaMask) {
//       console.log('MetaMask Here!');

//       window.ethereum.request({ method: 'eth_requestAccounts'})
//       .then(result => {
//         accountChangedHandler(result[0]);
//         setConnButtonText('Wallet Connected');
//       })
//       .catch(error => {
//         setErrorMessage(error.message);
      
//       });
//     } else {
//       console.log('Need to install MetaMask');
//       setErrorMessage('Please install MetaMask browser extension to interact');
//     }
//   }

//   const accountChangedHandler = (newAccount) => {
// 		const acc = ethers.utils.getAddress(newAccount);
//     setDefaultAccount(acc);
// 	}


// 	const chainChangedHandler = () => {
// 		window.location.reload();
// 	}

//   // useEffect(() =>
//   // {
//   //   if(defaultAccount!=null)
//   //   {
//   //     const acc = ethers.utils.getAddress(defaultAccount);
//   //     setDefaultAccount(acc);
//   //   }
    
//   // },[defaultAccount])


// 	// listen for account changes
// 	window.ethereum.on('accountsChanged', accountChangedHandler);

// 	window.ethereum.on('chainChanged', chainChangedHandler);
//   return (
//     <div>
//       {/* <h1>{!defaultAccount? "Connect your wallet!" : <p>Your wallet address: {defaultAccount} </p>}</h1> */}
//       <button style={{backgroundColor: '#008080',borderRadius: 10,color:'white', marginTop: 10,marginRight:10, fontSize: 20}}onClick={connectWallet}>{connButtonText}</button>
//       <h2>Wallet address: {defaultAccount}</h2>
//       <GetAllSafes walletAddress = {defaultAccount}/>
//     </div>
//   )
// }



