import React,{ useState} from 'react'
import { useSearchParams } from 'react-router-dom'
import {EthersAdapter} from '@safe-global/protocol-kit'
import { ethers } from "ethers";
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit'

const Queue = () =>{
  
  const [searchParams] = useSearchParams();
  const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
  const [pendingTx, setPendingTx] = useState(false);
  const safeAddress = searchParams.get('safeAddress');
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
 

  const getPendingTxn = async() =>{  
    const pending = await safeService.getPendingTransactions(safeAddress);
    const pendingTx = pending['results']
    setPendingTx(pendingTx);
    // console.log(pendingTx);
  }

  const executeTxn = async(txHash) =>{
    const safeSdk = await Safe.create(safeConfig);
    const safeTransaction = await safeService.getTransaction(txHash);
    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
    const receipt = await executeTxResponse.transactionResponse?.wait();

    console.log('Transaction executed:')
    console.log(`https://goerli.etherscan.io/tx/${receipt?.transactionHash}`)
  }

  const confirmTxn = async(txHash) =>{
    const safeSdk = await Safe.create(safeConfig);
    const signature = await safeSdk.signTransactionHash(txHash)
    const response = await safeService.confirmTransaction(txHash, signature.data)
    console.log(response);
  }

  const rejectTxn = async(txHash) =>
  {
    const safeSdk = await Safe.create(safeConfig);
    const safeTransaction = await safeService.getTransaction(txHash);
    console.log(safeTransaction['nonce']);
    const rejectionTransaction = await safeSdk.createRejectionTransaction(safeTransaction['nonce'])
    console.log(rejectionTransaction);
    const executeTxResponse = await safeSdk.executeTransaction(rejectionTransaction);
    const receipt = await executeTxResponse.transactionResponse?.wait();

    console.log('Transaction replaced:')
    console.log(`https://goerli.etherscan.io/tx/${receipt?.transactionHash}`)
  }

  return (
    <div>
      <button style={{backgroundColor: '#008080',color: 'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={getPendingTxn}>Get Pending Transactions</button>
      {!pendingTx ? <h1 style={{
                width: "30em",
                backgroundColor: "#d8f8f5",                                     
                padding: 2,
                borderRadius: 10,
                marginBlock: 10,
                fontSize: 20, 
                color: 'black' 
                }}>NULL</h1>: pendingTx.map(each => {
            return (
            <div key = {each['nonce']} >
                
                <div style={{padding: '20px',borderStyle:'groove',margin:'20px',backgroundColor:'#d8f8f5'}}>
                    <div>
                        <span style={{padding:'20px'}}>Nonce: {each['nonce']}</span>
                        <span style={{padding:'20px'}}> - {ethers.utils.formatEther(each['value'])} GOR </span>
                        <span style={{padding:'20px'}}>Confirmations: {each['confirmations'].length} out of {each['confirmationsRequired']}</span>
                    </div>
                    <div>
                        <p style={{padding:'20px'}}>Send {ethers.utils.formatEther(each['value'])} GOR to: {each['to']}</p>
                        <p style={{padding:'20px'}}>Safe Transaction hash: {each['safeTxHash']}</p>
                        {each['confirmations'].length!==each['confirmationsRequired'] ? 
                        <div>
                          <span><button style={{color:'#008C73'}} onClick={() => confirmTxn(each['safeTxHash'])}>Confirm</button></span>
                          <span><button style={{backgroundColor:'#F02525',color:'white',borderRadius:'5px',fontSize:20}} onClick={() => rejectTxn(each['safeTxHash'])}>Replace</button></span>
                        </div>
                        :
                        <div>
                            <span style={{padding:'20px'}}><button style={{backgroundColor:'#008C73',color:'white',borderRadius:'5px',fontSize:20}} onClick={() => executeTxn(each['safeTxHash'])}>Execute</button></span>
                            <span><button style={{backgroundColor:'#F02525',color:'white',borderRadius:'5px',fontSize:20}} onClick={() => rejectTxn(each['safeTxHash'])}>Replace</button></span>
                        </div>
                        }
                    </div>
                    
                </div>
            </div>
            );
        })}
    </div>
  )
}

export default Queue