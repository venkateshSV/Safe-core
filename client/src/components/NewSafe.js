import React from 'react'
import {EthersAdapter} from '@safe-global/protocol-kit'

const NewSafe = () =>{
    const fun = async()=>
    {
        console.log(10);
    }
  return (
    <button style={{backgroundColor: '#008080',color: 'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}} onClick={fun}>New Safe</button>
  )
}

export default NewSafe