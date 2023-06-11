import React,{ useState,useEffect} from 'react'
import axios from 'axios';
import { ethers,providers } from "ethers";
import Safe from '@safe-global/protocol-kit';
import {EthersAdapter} from '@safe-global/protocol-kit'
import {SafeTransactionDataPartial} from '@safe-global/safe-core-sdk-types'
import SafeApiKit from '@safe-global/api-kit'
import {createSearchParams, Link, useNavigate} from 'react-router-dom'

const CreateTransaction = ({safeAddress}) =>{
    const [showForm, setShowForm] = useState(false);
    const [toAddress,setToAddress] = useState("");
    const [amount,setAmount] = useState("");
    const navigate = useNavigate();

    const url = "http://localhost:8080/"; 
    const txServiceUrl = 'https://safe-transaction-goerli.safe.global'
    const showForms = () => {
    setShowForm(!showForm);
  }
  const handleSubmit = (event) => {
    event.preventDefault();
    // console.log(toAddress);
    // console.log(amount);
    showForms();
    createTxn();
  }
  useEffect(() => {
    showForms();
  }, []);

    const createTxn = async() =>{
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(0);
        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer || provider
          })
        const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter})   
        console.log(toAddress);
        console.log(amount);
        const amt = ethers.utils.parseUnits(amount, 'ether').toString()
        const safeTransactionData = {
          to: toAddress,
          data: '0x',
          value: amt
        }
        const safeConfig = {
          ethAdapter: ethAdapter,
          safeAddress: safeAddress
        }
        const safeSdk = await Safe.create(safeConfig);
        const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });
        const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
        const senderSignature = await safeSdk.signTransactionHash(safeTxHash)
        await safeService.proposeTransaction({
          safeAddress,
          safeTransactionData: safeTransaction.data,
          safeTxHash,
          senderAddress: await signer.getAddress(),
          senderSignature: senderSignature.data
        })
      } catch (error) {
        console.log(error);
      }
        
    }
    const openTransactions = () =>
    {
        navigate({
            pathname: "/transaction",
            search : createSearchParams({
                safeAddress: safeAddress
            }).toString()

        });
    };
  return (
    <div>
      {/* <button style={{backgroundColor: '#008080',color:'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={showForms}>New Transaction</button> */}
      <div style={{paddingTop:'30px'}}>
        {
          showForm && (
            <form onSubmit={handleSubmit} style={{
              borderRadius: '5px',
              backgroundColor: '#f2f2f2',
              padding:'20px'
            }
            }>
              <div>
                <label>Reciepent address:
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
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                  />
                </label>
              </div>
              <div>
                <label>Amount:
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </label>
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
      {/* <button style={{backgroundColor: '#008080',color:'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={() =>openTransactions()}>Transactions</button> */}
    </div>
    
  )
}

export default CreateTransaction