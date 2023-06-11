import React,{ useState} from 'react'
import axios from 'axios';
import { useSearchParams,createSearchParams,useNavigate } from 'react-router-dom'
import { Sidebar, Menu, MenuItem, SubMenu,sidebarClasses } from 'react-pro-sidebar';
import Transactions from './Transactions';
import Settings from './Settings';
import { Link } from 'react-router-dom';
import Assets from './Assets';
import CreateTransaction from './CreateTransaction';

const Dashboard = () =>{
    const [searchParams] = useSearchParams();
    const [currentPage,setCurrentPage] = useState('home');
    const safeAddress = searchParams.get("id");   
    const navigate = useNavigate();

    const openTransactions = () =>{
        setCurrentPage('transactions');
    }
    const openSettings = () =>{
      setCurrentPage('settings');
    }
    const openAssets = () =>{
      setCurrentPage('assets');
    }
    const openHome = () =>{
      setCurrentPage('home');
    }
    const openNewTransaction = () =>{
      setCurrentPage('newTransaction')
    }


  return (
    <div style={{alignItems:'center',justifyContent:'space-evenly',paddingTop:'91px'}}>
        <div style={{float:'left',paddingRight:'50px',position:'fixed'}}>
          <Sidebar rootStyles={{
              [`.${sidebarClasses.container}`]: {
                backgroundColor: '#0CABA8',
                width:220,
                position:'absolute',
                height:'91vh'
              },
            }}>
              <Menu>
                <MenuItem onClick={openNewTransaction} style={{color:'black',backgroundColor:'#0FC2C0',border:'2px solid black',borderRadius:'10px',fontSize:'20px',paddingTop:'30px',paddingBottom:'30px'}}>New Transaction</MenuItem>
              </Menu>
            <Menu style={{paddingTop:'30px'}}>
              <MenuItem onClick={openHome}>Home</MenuItem>
              <MenuItem onClick={openAssets}>Assets</MenuItem>
              <MenuItem onClick={openTransactions}>Transactions</MenuItem>
              <MenuItem onClick={openSettings}>Settings</MenuItem>
            </Menu>
          </Sidebar>
        </div>
        {
            currentPage=='home' ? 
            <div style={{paddingLeft:'300px'}}>
            <h1>
              <p>
                  Your current safe address is : <p style={{fontSize:'40px'}}>{safeAddress}</p>
              </p>
            </h1>
          </div>
          : currentPage=='transactions' ?
            <div style={{paddingLeft:'300px'}}>
                <Transactions />
            </div>
          : currentPage=='settings' ?
            <div style={{paddingLeft:'300px'}}>
                <Settings />
            </div>
          :currentPage=='assets' ?
          <div style={{paddingLeft:'300px'}}>
              <Assets />
          </div>
          :currentPage=='newTransaction' ?
          <div style={{paddingLeft:'300px'}}>
              <CreateTransaction/>
          </div>
          :
          <div style={{paddingLeft:'300px'}}>
            <h1>
              <p>
                  Visiting random
              </p>
              
          </h1>
          </div> 

        }
    </div>
  )
}

export default Dashboard