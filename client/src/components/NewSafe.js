import React,{ useState} from 'react'
import { ethers,providers } from "ethers";
import {EthersAdapter} from '@safe-global/protocol-kit'
import { SafeFactory } from '@safe-global/protocol-kit'

const NewSafe = () =>{
    const [showForm, setShowForm] = useState(false);
    const [toAddress,setToAddress] = useState("");
    const txServiceUrl = 'https://safe-transaction-goerli.safe.global'

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: signer || provider
    })
    
    const showForms = () => {
    setShowForm(!showForm);
    }

    const handleSubmit = (event) => {
    event.preventDefault();
    showForms();
    deploySafe();
    }
    
    const deploySafe = async() =>{
      const safeAccountConfig = {
        owners: [
          toAddress
        ],
        threshold: 1,
      }
      const saltNonce = 1686075664858;
      const options = {
        gasLimit: 392440,
      }
      const safeFactory = await SafeFactory.create({ethAdapter: ethAdapter})
      const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig,saltNonce,options })

      const safeAddress = await safeSdkOwner1.getAddress()

      console.log('Your Safe has been deployed:')
      console.log(`https://goerli.etherscan.io/address/${safeAddress}`)
      console.log(`https://app.safe.global/gor:${safeAddress}`)
    }




  return (
      <div>
      <button style={{backgroundColor: '#008080',color:'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={showForms}>New Safe</button>
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
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
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
  )
}

export default NewSafe