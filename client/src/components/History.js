import React,{ useState} from 'react'
import { useSearchParams } from 'react-router-dom'

import { ethers } from "ethers";
import {EthersAdapter} from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'

const History = () => {
    
    const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
    const [searchParams] = useSearchParams();
    const safeAddress = searchParams.get('safeAddress');
    const [allSafeTxns,setAllSafeTxns] = useState(null);

    const getAllTxns = async() =>{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(0);
        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer || provider
          });
        const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter});   
        const allTxs = await safeService.getAllTransactions(safeAddress);
        setAllSafeTxns(allTxs['results']);
        console.log(allTxs['results']);
    }
  return (
    <div>
        <button style={{backgroundColor: '#008080',color:'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}} onClick = {getAllTxns}>Show All Txn</button>
        {!allSafeTxns ? <h1 style={{
                width: "30em",
                backgroundColor: "#d8f8f5",                                     
                padding: 2,
                borderRadius: 10,
                marginBlock: 10,
                fontSize: 20, 
                color: 'black' 
                }}>NULL</h1>: allSafeTxns.map(each => {
            return (
            <div key = {each['executionDate']+each['nonce']} >
                {each['isExecuted']==true ?
                <div style={{padding: '20px',borderStyle:'groove',margin:'20px',backgroundColor:'#d8f8f5'}}>
                    <div>
                        <span style={{padding:'20px'}}>Nonce: {each['nonce']}</span>
                        <span style={{padding:'20px'}}>{!each['dataDecoded'] ? <span></span> : each['dataDecoded']['method']}</span>
                        {each['isSuccessful']==true ? <span style={{color:'green'}}>Success</span> : <span style={{color:'red'}}>Failed</span>}
                    </div>
                    <div>
                    {each['value']!=0 ? 
                        <span style={{padding:'20px'}}>Sent {ethers.utils.formatEther(each['value'])} GOR from <span style={{color:'red'}}>{each['transfers'][0]['from']}</span> to <span style={{color:'green'}}>{each['transfers'][0]['to']}</span> </span>
                    :<span></span>}    
                    </div>
                    <div>
                        <p style={{padding:'20px'}}>Safe Transaction hash: {each['safeTxHash']}</p>
                        <p style={{padding:'20px'}}>Transaction hash: {each['transactionHash']}</p>
                    </div>
                    
                </div>
            
            :<p></p>}
            </div>
            );
        })}
    </div>
  )
}

export default History