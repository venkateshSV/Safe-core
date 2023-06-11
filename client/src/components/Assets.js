import React,{ useState,useEffect} from 'react'
import { useSearchParams } from 'react-router-dom'
import {EthersAdapter} from '@safe-global/protocol-kit'
import { ethers } from "ethers";
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit'
import {ThreeDots} from 'react-loader-spinner'

const Assets = () =>{
    const [searchParams] = useSearchParams();
    const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
    const [balance, setbalance] = useState(false);
    const [assetName,setAssetName] = useState(null);
    const safeAddress = searchParams.get('id');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer || provider
        });
    const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter});
    const safeConfig = {
        ethAdapter: ethAdapter,
        safeAddress: safeAddress
    }

    const getBalances = async() =>{
        const safeSdk = await Safe.create(safeConfig);
        let balance = await safeSdk.getBalance();
        balance = balance/1e16;
        balance = balance/100;
        setbalance(balance);
        setAssetName(provider.network['name']);
        console.log(balance);
        console.log(provider.network['name']);
    }
    useEffect(() => {
        getBalances();
      }, []);

  return (
    <div>
        {!balance ? <div style={{marginLeft:'auto',marginRight:'auto',width:'8em'}}><ThreeDots 
                        height="100" 
                        width="100" 
                        radius="9"
                        color="#008080" 
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{}}
                        wrapperClassName=""
                        visible={true}
                        /></div>:
        <div style={{padding: '20px',borderStyle:'groove',margin:'20px',backgroundColor:'#d8f8f5',width:'50%'}}>
            <span style={{paddingRight:'100px'}}>{assetName} Ether</span>
            <span style={{paddingLeft:'400px'}}>{balance} GOR </span>
        </div>
}
    </div>
  )
}

export default Assets