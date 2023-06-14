import React,{ useState,useEffect} from 'react'
import { useSearchParams } from 'react-router-dom'
import {EthersAdapter} from '@safe-global/protocol-kit'
import { ethers } from "ethers";
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit'
import {ThreeDots} from 'react-loader-spinner'

const Queue = () =>{
  
  const [searchParams] = useSearchParams();
  const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
  const [pendingTx, setPendingTx] = useState(false);
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
 

  const getPendingTxn = async() =>{  
    const pending = await safeService.getPendingTransactions(safeAddress);
    const pendingTx = pending['results']
    setPendingTx(pendingTx.reverse());
    console.log(pendingTx);
  }

  const executeBatch = async() =>
  {
    var safeTransactionData = [];
    pendingTx.forEach(element => {
      var obj = {
        to: element['to'],
        data: (element['data']==null ? '0x': element['data']),
        value: element['value'],
        nonce: element['nonce']
      }
      safeTransactionData.push(obj);
    });
    const callsOnly = true;
    console.log(safeTransactionData);
    const safeSdk = await Safe.create(safeConfig);
    // if(pendingTx.length>1)
    // {
    //   for(let i=1;i<pendingTx.length;i++)
    //   {
    //     const nonce = pendingTx[i]['nonce'];
    //     const rejectionTransaction = await safeSdk.createRejectionTransaction(nonce);
    //     console.log(rejectionTransaction);
    //     safeTransactionData.push(rejectionTransaction['data']);
    //   }
    // }
    // console.log(safeTransactionData);
    const safeTransaction = await safeSdk.createTransaction({safeTransactionData,callsOnly});
    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
    const receipt = await executeTxResponse.transactionResponse?.wait();

    console.log('Transaction executed:');
    console.log(`https://goerli.etherscan.io/tx/${receipt?.transactionHash}`);

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
    console.log(txHash);
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
  useEffect(() => {
    getPendingTxn();
  }, []);

  return (
    <div>
      {/* <button style={{backgroundColor: '#008080',color: 'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={getPendingTxn}>Get Pending Transactions</button> */}
      {!pendingTx ? <div style={{marginLeft:'auto',marginRight:'auto',width:'8em'}}><ThreeDots 
                        height="100" 
                        width="100" 
                        radius="9"
                        color="#008080" 
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{}}
                        wrapperClassName=""
                        visible={true}
                        /></div>: 
                        <div>
                          <button style={{backgroundColor: '#008080',color: 'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={executeBatch}>Execute Batch</button>
                          {
                            pendingTx.map(each => {
                              return (
                                  <div>
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
                                  </div>
                              );
                          })
                          }
                        </div>
      }
    </div>
  )
}

export default Queue