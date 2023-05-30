import React,{ useState} from 'react'
import axios from 'axios';

const GetAllSafes = ({walletAddress}) =>{

    const url = "http://localhost:8080/";
    const [getAllSafes,setGetAllSafes] = useState(null);

    const getSafes = async() =>
    {
        try
        {
            const account = {walletAddress};
            // console.log(account);
            const body_data = {
                "ownerAddress" : account['walletAddress']
            };
            try {
                const {data} = await axios({
                    method: 'put',
                    url: url+'getAllSafes',
                    data: body_data
                })
                safeDataChange({data});
                console.log(getAllSafes);
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
    const safeDataChange = (newData) =>
    {
        console.log(10);
        console.log(newData['data']['safes']);
        setGetAllSafes(newData['data']['safes']);
    }
  return (
    <div>
        <button style={{backgroundColor: '#008080',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 16}}onClick={getSafes}>Get all Safes</button>
        <div className="getAllSafesclass">
            <h1 style={{ color: "green" }}>Safes corresponding to the connected wallet</h1>
            <center>
                {!getAllSafes ? <h1 style={{
                        width: "30em",
                        backgroundColor: "#35D841",                                     
                        padding: 2,
                        borderRadius: 10,
                        marginBlock: 10,
                        fontSize: 20, 
                        color: 'white' 
                        }}>NULL</h1>: getAllSafes.map(each => {
                    return (
                    <div
                        style={{
                        width: "30em",
                        backgroundColor: "#35D841",                                     
                        padding: 2,
                        borderRadius: 10,
                        marginBlock: 10,
                        }}
                    >
                        <p style={{ fontSize: 20, color: 'white' }}>{each}</p>
                    </div>
                    );
                })}
            </center>

        </div>
    </div>
  )
}

export default GetAllSafes