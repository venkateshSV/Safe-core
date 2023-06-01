import React,{ useState} from 'react'
import axios from 'axios';
import Home from './Home';
import {createSearchParams, Link, useNavigate} from 'react-router-dom'

const GetAllSafes = ({walletAddress}) =>{

    const url = "http://localhost:8080/";
    const [getAllSafes,setGetAllSafes] = useState(null);
    const navigate = useNavigate();
 
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
        setGetAllSafes(newData['data']['safes']);
    }

    const openSafe = (id) =>
    {
        navigate({
            pathname: "/home",
            search : createSearchParams({
                id: id
            }).toString()

        });
    };

  return (
    <div>
        <button style={{backgroundColor: '#008080',color: 'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={getSafes}>Get all Safes</button>
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
                        key = {each}
                        style={{
                        padding: 2,
                        borderRadius: 10,
                        marginBlock: 10,
                        }}
                    >
                        <button style={{ fontSize: 20, color: 'green' , backgroundColor: "#35D841"}} onClick={() => openSafe(each)} >{each}</button>
                    </div>
                    );
                })}
            </center>

        </div>
    </div>
  )
}

export default GetAllSafes