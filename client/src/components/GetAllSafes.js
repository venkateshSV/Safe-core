import React,{ useState} from 'react'
import axios from 'axios';
import Home from './Home';
import {createSearchParams, Link, useNavigate} from 'react-router-dom'
import NewSafe from './NewSafe';

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
        <NewSafe />
        <button style={{backgroundColor: '#008080',color: 'white',borderRadius: 10, marginTop: 10,marginRight:10, fontSize: 20}}onClick={getSafes}>Get all Safes</button>
        <div className="getAllSafesclass">
            <h1 style={{ color: "#003C6D" }}>Safes corresponding to the connected wallet</h1>
            <center>
                {!getAllSafes ? <h1 style={{
                        width: "30em",
                        backgroundColor: "#003C6D",                                     
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
                        paddingBottom: '20px',
                        borderRadius: 5,
                        // width:'30em',
                        alignItems:'center',
                        }}
                    >
                        <button style={{ width: '30em',fontSize: '30px', color: 'white' , backgroundColor:'#003C6D',borderColor:'#CFD2DF',borderRadius:8}} onClick={() => openSafe(each)} >{each}</button>
                    </div>
                    );
                })}
            </center>

        </div>
    </div>
  )
}

export default GetAllSafes