import React from 'react'
import { useSearchParams } from 'react-router-dom'

const Home = () =>{
    const [searchParams] = useSearchParams();
    console.log(searchParams.get("id"));    
  return (
    <div>
        <h1>
            <p>
                Your current safe address is : {searchParams.get("id")};
            </p>
            
        </h1>
    </div>
  )
}

export default Home