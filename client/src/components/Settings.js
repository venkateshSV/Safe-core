import React,{ useState,useEffect} from 'react'
import axios from 'axios';
import { useSearchParams } from 'react-router-dom'
import {ThreeDots} from 'react-loader-spinner'

function Settings() {
    const [searchParams] = useSearchParams();
    const [safeInfo,setSafeInfo] = useState(null);

    const safeAddress = searchParams.get("id");   
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
    useEffect(() => {
        getSafesInfo();
      }, []);
  return (
    <div>
        <div>
          {/* <button style={{backgroundColor: '#008080',color:'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={getSafesInfo}>Get Safe Info</button> */}
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
            </div>

          }

          </div>
      </div>
    </div>
  )
}

export default Settings