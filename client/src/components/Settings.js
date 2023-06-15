import React,{ useState,useEffect} from 'react'
import axios from 'axios';
import { useSearchParams } from 'react-router-dom'
import {ThreeDots} from 'react-loader-spinner'
import {EthersAdapter} from '@safe-global/protocol-kit'
import { ethers } from "ethers";
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit'
import {ToastContainer,toast} from 'react-toastify'

function Settings() {
    const [searchParams] = useSearchParams();
    const [safeInfo,setSafeInfo] = useState(null);
    const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
    const [delegateAdd,setDelegateAdd] = useState('');
    const [allSafeDelegates,setAllSafeDelegates]= useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showFormThresh, setShowFormThresh] = useState(false);
    const [updThreshold,setUpdThreshold] = useState(0);
    const [showFormOwner, setShowFormOwner] = useState(false);
    const [ownerAdd,setOwnerAdd] = useState('');
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
    const showForms = () => {
    setShowForm(!showForm);
  }
  const showFormsOwner = () =>
  {
    setShowFormOwner(!showFormOwner);
  }
  const showFormsThresh = () =>
  {
    setShowFormThresh(!showFormThresh);
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log(toAddress);
    // console.log(amount);
    showForms();
    addDelegate();
  }
  const handleSubmitOwner = (event) => {
    event.preventDefault();
    // console.log(toAddress);
    // console.log(amount);
    showFormsOwner();
    addOwner();
  }
  const handleSubmitThresh = (event) => {
    event.preventDefault();
    showFormsThresh();
    changeThreshold();
  }
    const url = "http://localhost:8080/"; 
    const getSafesInfo = async() =>
    {
        try
        {
          const body_data = {
              "safeAddress" : safeAddress
          };
          try {
              const {data} = await axios({
                  method: 'put',
                  url: url+'getSafeInfo',
                  data: body_data
              })
              console.log(data);
              safeInfoChange({data});
          } catch (err) {
              if (err.response.status === 404) {
                  console.log('Resource could not be found!');
              } else {
                  console.log(err.message);
              }
          }
          }catch(error)
          {
          console.log(error);
          }
    }

    const safeInfoChange = (newData) =>
    {
      setSafeInfo(newData['data']);
    }
    const addDelegate = async() =>
    {
      const delegateConfig = {
        safeAddress: safeAddress, // Optional
        delegateAddress: delegateAdd,
        delegatorAddress: await signer.getAddress(),
        label:'delegate',
        signer:signer
      }
      await safeService.addSafeDelegate(delegateConfig);
      console.log("Delegate added Successfully");
    }
    const removeOwner = async(ownerAdd) =>
    {
      const params = {
        ownerAddress: ownerAdd,
        threshold: 1
      }
      const safeSdk = await Safe.create(safeConfig);
      const safeTransaction = await safeSdk.createRemoveOwnerTx(params)
      const txResponse = await safeSdk.executeTransaction(safeTransaction)
      await txResponse.transactionResponse?.wait()
      console.log('Removed owner');
    }
    const addOwner = async() =>
    {
      console.log(ownerAdd);
      const params = {
        ownerAddress: ownerAdd,
        threshold: 1 
      }
      const safeSdk = await Safe.create(safeConfig);
      const safeTransaction = await safeSdk.createAddOwnerTx(params)
      const txResponse = await safeSdk.executeTransaction(safeTransaction)
      await txResponse.transactionResponse?.wait()
      console.log('Added');
    }
    const changeThreshold = async(maxi) =>
    {
      if(updThreshold>maxi)
      {
        toast.error('The threshold value entered is invalid.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          });

      }else{
        const safeSdk = await Safe.create(safeConfig);
        const safeTransaction = await safeSdk.createChangeThresholdTx(updThreshold);
        const txResponse = await safeSdk.executeTransaction(safeTransaction);
        await txResponse.transactionResponse?.wait()
        console.log('Changed');
      }
    }
    const getDelegates = async() =>{
      const delegateConfig ={
        safeAddress: safeAddress
      }
      const allDelegates = await safeService.getSafeDelegates(delegateConfig);
      setAllSafeDelegates(allDelegates);
      console.log(allDelegates);

    }
    const removeDelegate = async(delAdd) =>
    {
      const delegateConfig = {
        delegateAddress: delAdd,
        delegatorAddress: await signer.getAddress(),
        signer:signer
      }
      await safeService.removeSafeDelegate(delegateConfig);
      console.log('Deleted delegate');
    }
    useEffect(() => {
        getSafesInfo();
        getDelegates();
      }, []);
  return (
    <div>
        <div>
          <div>
          {!safeInfo ? <div style={{marginLeft:'auto',marginRight:'auto',width:'8em'}}><ThreeDots 
                        height="100" 
                        width="100" 
                        radius="9"
                        color="#008080" 
                        ariaLabel="three-dots-loading"
                        wrapperStyle={{}}
                        wrapperClassName=""
                        visible={true}
                        /></div> : 
            <div>
              <h2>Nonce : {safeInfo['nonce']}</h2>
              <h2>Threshold : {safeInfo['threshold']}</h2>
              <h2>Version : {safeInfo['version']}</h2>
              <h2>Owners: {safeInfo['owners'].length}</h2>
              {
                safeInfo['owners'].map(each => {
                  return (
                  <div
                      key = {each}
                      style={{
                        padding: '10px',borderStyle:'groove',margin:'10px',backgroundColor:'#E8EAF5',borderColor:'#CFD2DF',borderRadius:8,width:'50em'
                      }}
                  >
                      <span style={{color:'green', fontSize:25,paddingRight:'50px'}}>{each}</span>
                      <span><button style={{backgroundColor: '#F02525',color: 'white',borderRadius: 5, marginTop: 10,marginRight:10, fontSize: 20}}onClick={() => removeOwner(each)}>Remove</button></span>
                  </div>
                  );
              })
              }
              <button style={{backgroundColor: '#003C6D',color: 'white',borderRadius: 5, marginTop: 10,marginRight:10, fontSize: 20}}onClick={showFormsOwner}>+ Add new owner</button>
              <div>
              {
                showFormOwner && (
                  <form onSubmit={handleSubmitOwner} style={{
                    borderRadius: '5px',
                    backgroundColor: '#f2f2f2',
                    padding:'20px'
                  }
                  }>
                    <div>
                      <label>Owner address:
                        <input
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            margin: '8px 0',
                            display: 'inline-block',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                          type='text'
                          value={ownerAdd}
                          onChange={(e) => setOwnerAdd(e.target.value)}
                        />
                      </label>
                    </div>
                    <div>
                      <input style={{
                        width: '100%',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '14px 20px',
                        margin: '8px 0',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }} type="submit" value="Submit"></input>
                    </div>
                  </form>
              )}
              </div>
              <div>
                <h2>Required Confirmations:</h2>
                <p style={{fontSize:'20px'}}>Any confirmations requires the confirmations of:</p>
                <p style={{fontSize:'20px'}}><b>{safeInfo['threshold']}</b> out of <b>{safeInfo['owners'].length}</b> owners.</p>
                <button style={{backgroundColor: '#003C6D',color: 'white',borderRadius: 5, marginTop: 10,marginRight:10, fontSize: 20}}onClick={showFormsThresh}>Change</button>
                <div>
              {
                showFormThresh && (
                  <form onSubmit={handleSubmitThresh} style={{
                    borderRadius: '5px',
                    backgroundColor: '#f2f2f2',
                    padding:'20px'
                  }
                  }>
                    <div>
                      <label>Updated Threshold &#40;value should be less than {safeInfo['owners'].length}&#41;:
                        <input
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            margin: '8px 0',
                            display: 'inline-block',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                          type='text'
                          value={updThreshold}
                          onChange={(e) => setUpdThreshold(e.target.value)}
                        />
                      </label>
                    </div>
                    <div>
                      <input style={{
                        width: '100%',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '14px 20px',
                        margin: '8px 0',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }} type="submit" value="Submit"></input>
                    </div>
                  </form>
              )}
              </div>
              </div>
              <h2>Delegates: {allSafeDelegates['count']}</h2>
              {
                allSafeDelegates['results'].map(each => {
                  return (
                  <div
                      style={{
                        padding: '10px',borderStyle:'groove',margin:'10px',backgroundColor:'#E8EAF5',borderColor:'#CFD2DF',borderRadius:8,width:'50em'
                      }}
                  >
                      <span style={{color:'green', fontSize:25,paddingRight:'50px'}}>{each['delegate']}</span>
                      <span><button style={{backgroundColor: '#F02525',color: 'white',borderRadius: 5, marginTop: 10,marginRight:10, fontSize: 20}}onClick={() => removeDelegate(each['delegate'])}>Remove</button></span>
                  </div>
                  );
              })
              }
              <button style={{backgroundColor: '#003C6D',color: 'white',borderRadius: 5, marginTop: 10,marginRight:10, fontSize: 20}}onClick={showForms}>Add delegate</button>
            </div>
          }
          </div>
          <div>
              {
                showForm && (
                  <form onSubmit={handleSubmit} style={{
                    borderRadius: '5px',
                    backgroundColor: '#f2f2f2',
                    padding:'20px'
                  }
                  }>
                    <div>
                      <label>Delegate address:
                        <input
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            margin: '8px 0',
                            display: 'inline-block',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxSizing: 'border-box'
                          }}
                          type='text'
                          value={delegateAdd}
                          onChange={(e) => setDelegateAdd(e.target.value)}
                        />
                      </label>
                    </div>
                    <div>
                      <input style={{
                        width: '100%',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '14px 20px',
                        margin: '8px 0',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }} type="submit" value="Submit"></input>
                    </div>
                  </form>
              )}
              </div>
      </div>
    </div>
  )
}

export default Settings