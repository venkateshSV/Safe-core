import React,{ useState,useEffect} from 'react'
import { useSearchParams } from 'react-router-dom'
import {EthersAdapter} from '@safe-global/protocol-kit'
import { ethers } from "ethers";
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit'
import {ThreeDots,Oval} from 'react-loader-spinner'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Queue = () =>{
  
  const [searchParams] = useSearchParams();
  const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
  const [txStatus,setTxStatus] = useState('');
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
    const validTx = await safeSdk.isOwner(signer.getAddress());
    if(validTx==true)
    {
      setTxStatus('Processing');
      const safeTransaction = await safeService.getTransaction(txHash);
      const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
      const receipt = await executeTxResponse.transactionResponse?.wait();
      setTxStatus('Successful');
      console.log('Transaction executed:')
      console.log(`https://goerli.etherscan.io/tx/${receipt?.transactionHash}`)
    }else{
      // alert.error('The wallet address is not an owner of the current safe.');
      toast.error('The wallet address is not an owner of the current safe.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
    }

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
    const validTx = await safeSdk.isOwner(signer.getAddress());
    if(validTx==true)
    {
      const safeTransaction = await safeService.getTransaction(txHash);
      console.log(safeTransaction['nonce']);
      const rejectionTransaction = await safeSdk.createRejectionTransaction(safeTransaction['nonce'])
      console.log(rejectionTransaction);
      const executeTxResponse = await safeSdk.executeTransaction(rejectionTransaction);
      const receipt = await executeTxResponse.transactionResponse?.wait();
  
      console.log('Transaction replaced:')
      console.log(`https://goerli.etherscan.io/tx/${receipt?.transactionHash}`)
    }else{
      toast.error('The wallet address is not an owner of the current safe.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        });
    }

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
                          <button style={{backgroundColor: '#003C6D',color: 'white',borderRadius: 5, marginTop: 10,marginRight:10, fontSize: 20}}onClick={executeBatch}>Execute Batch</button>
                          {
                            pendingTx.map(each => {
                              return (
                                  <div>
                                      <div key = {each['nonce']} >
                                          
                                          <div style={{padding: '20px',borderStyle:'groove',margin:'20px',backgroundColor:'#E8EAF5',borderColor:'#CFD2DF',borderRadius:8}}>
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
                                                    <span style={{padding:'20px'}}><button style={{backgroundColor:'#008C73',color:'white',borderRadius:'5px',fontSize:20}} onClick={() => confirmTxn(each['safeTxHash'])}>Confirm</button></span>
                                                    <span><button style={{backgroundColor:'#F02525',color:'white',borderRadius:'5px',fontSize:20}} onClick={() => rejectTxn(each['safeTxHash'])}>Replace</button></span>
                                                  </div>
                                                  :
                                                  <div>
                                                    <ToastContainer />
                                                      <span style={{padding:'20px'}}><button style={{backgroundColor:'#008C73',color:'white',borderRadius:'5px',fontSize:20}} onClick={() => executeTxn(each['safeTxHash'])}>Execute</button></span>
                                                      <span><button style={{backgroundColor:'#F02525',color:'white',borderRadius:'5px',fontSize:20}} onClick={() => rejectTxn(each['safeTxHash'])}>Replace</button></span>
                                                      {txStatus=='Processing' ? 
                                                      <div style={{paddingLeft:'1000px'}}>
                                                        <span><Oval
                                                            height={40}
                                                            width={40}
                                                            color="#FFBF00"
                                                            wrapperStyle={{}}
                                                            wrapperClass=""
                                                            visible={true}
                                                            ariaLabel='oval-loading'
                                                            secondaryColor="#FFDB58"
                                                            strokeWidth={8}
                                                            strokeWidthSecondary={6}/></span>
                                                            <span style={{fontSize:'20px',color:'#FFBF00'}}>Processing</span>
                                                      </div> 
                                                      : txStatus=='Successful' ? 
                                                      <div style={{paddingLeft:'1000px'}}>
                                                        <span style={{fontSize:'20px',color:'#00A332'}}>Successful</span>
                                                      </div> : 
                                                      <div></div>}
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