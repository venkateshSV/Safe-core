import React,{ useState} from 'react'
import { useSearchParams } from 'react-router-dom'
import Queue from './Queue';
import History from './History';

const Transactions = () =>{
    const [showQueue,setShowQueue] = useState(true);
    const [showHistory,setShowHistory] = useState(false);

    const showQueues = () =>
    {
        setShowQueue(true);
        setShowHistory(false);
    }
    const showHistorys = () =>
    {
        setShowHistory(true);
        setShowQueue(false);
    }

  return (
    <div>
        <button style={{backgroundColor: '#003C6D',color:'white',borderRadius: 5, marginTop: 10,marginRight:10, fontSize: 20}} onClick = {showQueues}>Queue</button>
        <button style={{backgroundColor: '#003C6D',color:'white',borderRadius: 5, marginTop: 10,marginRight:10, fontSize: 20}} onClick = {showHistorys} >History</button>
        <div>
            {!showHistory ?  <Queue /> : <History />}
        </div>
    </div>
  )
}

export default Transactions