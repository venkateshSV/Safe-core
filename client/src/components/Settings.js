import React,{ useState,useEffect} from 'react'
import axios from 'axios';
import { useSearchParams } from 'react-router-dom'
import {ThreeDots} from 'react-loader-spinner'
import {EthersAdapter} from '@safe-global/protocol-kit'
import { ethers } from "ethers";
import Safe from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit'

function Settings() {
    const [searchParams] = useSearchParams();
    const [safeInfo,setSafeInfo] = useState(null);
    const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
    const [delegateAdd,setDelegateAdd] = useState('');
    const [showForm, setShowForm] = useState(false);
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
  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log(toAddress);
    // console.log(amount);
    showForms();
    addDelegate();
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
    const getDelegate = async() =>
    {
      const delegateConfig = {
        safeAddress: safeAddress
      };
      const safeDelegates = await safeService.getSafeDelegates(delegateConfig);
      console.log(safeDelegates);
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
    useEffect(() => {
        getSafesInfo();
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
                      padding: 2,
                      borderRadius: 10,
                      marginBlock: 10,
                      }}
                  >
                      <li style={{color:'green', fontSize:25}}>{each}</li>
                  </div>
                  );
              })
              }
              <button style={{backgroundColor: '#008080',color:'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={showForms}>Add delegate</button>
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