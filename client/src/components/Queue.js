import React,{ useState} from 'react'
import { useSearchParams } from 'react-router-dom'
const Queue = () =>{
  
  const [searchParams] = useSearchParams();
  const [showQueue, setShowQueue] = useState(false);
  const safeAddress = searchParams.get('safeAddress');


  return (
    <div>
        Queue is being shown!
    </div>
  )
}

export default Queue