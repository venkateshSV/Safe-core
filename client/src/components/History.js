import React,{ useState,useEffect} from 'react'
import { useSearchParams } from 'react-router-dom'
import {ThreeDots} from 'react-loader-spinner'

import { ethers } from "ethers";
import {EthersAdapter} from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'

const History = () => {
    
    const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
    const [searchParams] = useSearchParams();
    const safeAddress = searchParams.get('id');
    const [allSafeTxns,setAllSafeTxns] = useState(null);

    const getAllTxns = async() =>{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(0);
        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer || provider
          });
        const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter});   
        var allTxs = []; 
        allTxs = await safeService.getAllTransactions(safeAddress);
        setAllSafeTxns(allTxs['results']);
        console.log(allTxs['results']);
    }
    useEffect(() => {
        getAllTxns();
      }, []);
  return (
    <div>
        {/* <button style={{backgroundColor: '#008080',color:'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}} onClick = {getAllTxns}>Show All Txn</button> */}
        {!allSafeTxns ? <div style={{marginLeft:'auto',marginRight:'auto',width:'8em'}}><ThreeDots 
                        height="100" 
                        width="100" 
                        radius="9"
                        color="#008080" 
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{}}
                        wrapperClassName=""
                        visible={true}
                        /></div>: allSafeTxns.map(each => {
            return (
            <div key = {each['executionDate']+each['nonce']} >
                {each['isExecuted']==true ?
                <div style={{padding: '20px',borderStyle:'groove',margin:'20px',backgroundColor:'#E8EAF5',borderColor:'#CFD2DF',borderRadius:8}}>
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