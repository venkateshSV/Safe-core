// creating a ethers instance

import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { ethers } from 'ethers'
import Safe, { EthersAdapter, EthersTransactionOptions, SafeConfig } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import { SafeFactory } from '@safe-global/protocol-kit'
import { SafeAccountConfig } from '@safe-global/protocol-kit'
import { SafeTransactionDataPartial } from '@safe-global/safe-core-sdk-types'
require('dotenv').config()

const RPC_URL = 'https://eth-goerli.public.blastapi.io'
const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const txServiceUrl = 'https://safe-transaction-goerli.safe.global'

const safeAddress = '0xB20fF5bC0E44eAcEfc3490Cc02d2578Bb4250952'; // test-safe

var app = express();
app.use(cors(
  {
    origin : '*' 
  }
));
app.use(bodyParser.json());
app.use(express.json());


// ----------------------Make all the functions below------------------


// Initialize signers

// console.log(10);
const owner1Signer = new ethers.Wallet(process.env.OWNER_1_PRIVATE_KEY!,provider);
// console.log(owner1Signer);
const ethAdapterOwner1 = new EthersAdapter({
  ethers,
  signerOrProvider: owner1Signer
})

const safeService = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapterOwner1 })


let baseNonce = provider.getTransactionCount(new ethers.Wallet(process.env.OWNER_1_PRIVATE_KEY!,provider).address);
let nonceOffset = 0;
function getNonce() {        
  return baseNonce.then((nonce) => (nonce + (nonceOffset++)));
}

// var nonce_updated = getNonce().then(console.log);

async function deploySafe(threshold:number) : Promise<void>
{
  const safeAccountConfig: SafeAccountConfig = {
    owners: [
      await owner1Signer.getAddress(),
    ],
    threshold: 1,
  }
  const options: EthersTransactionOptions = {
    gasLimit: 271619,
    nonce: 5
  }
  const chainid = await ethAdapterOwner1.getChainId().then(console.log);
  console.log(chainid);
  const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapterOwner1 });
  const safeSdk = await safeFactory.deploySafe({safeAccountConfig,options});
  const safeAddress = await safeSdk.getAddress();
  
  console.log('Your Safe has been deployed:')
  console.log(`https://goerli.etherscan.io/address/${safeAddress}`)
  console.log(`https://app.safe.global/gor:${safeAddress}`)
  
}

// deploySafe(1);

async function createTransaction(to:string, amount:string) : Promise<any>
{
  const amt = ethers.utils.parseUnits(amount, 'ether').toString()
  const safeTransactionData: SafeTransactionDataPartial = {
    to: to,
    data: '0x',
    value: amt
  }
  // Create a Safe transaction with the provided parameters

  const safeConfig: SafeConfig={
    ethAdapter: ethAdapterOwner1,
    safeAddress: safeAddress
  }
  const safeSdk = await Safe.create(safeConfig);
  const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });
  const safeTxHash = await safeSdk.getTransactionHash(safeTransaction)
  const senderSignature = await safeSdk.signTransactionHash(safeTxHash)
  await safeService.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress: await owner1Signer.getAddress(),
    senderSignature: senderSignature.data
  })

} 

// createTransaction('0x517fF00d27eFE58a73969466c19af7C956066d36','0.0001');


      
async function confirmTransaction() : Promise<any>
{
  const pending = await safeService.getPendingTransactions(safeAddress);
  const pending_txn = await pending.results;
  const transaction = pending_txn[0];
  const safeTxHash = transaction.safeTxHash

  const safeSdkOwner1 = await Safe.create({
    ethAdapter: ethAdapterOwner1,
    safeAddress
  })

  const signature = await safeSdkOwner1.signTransactionHash(safeTxHash)
  const response = await safeService.confirmTransaction(safeTxHash, signature.data)
  return response;
}
// confirmTransaction();

async function executeTransaction(): Promise<any>
{
  const pending = await safeService.getPendingTransactions(safeAddress);
  const pending_txn = await pending.results;
  const transaction = pending_txn[0];
  const safeTxHash = transaction.safeTxHash

  const safeSdk = await Safe.create({
    ethAdapter: ethAdapterOwner1,
    safeAddress
  })

  const safeTransaction = await safeService.getTransaction(safeTxHash)
  const executeTxResponse = await safeSdk.executeTransaction(safeTransaction)
  const receipt = await executeTxResponse.transactionResponse?.wait()

  console.log('Transaction executed:')
  console.log(`https://goerli.etherscan.io/tx/${receipt?.transactionHash}`)
}

// executeTransaction();

async function getAllTxn(safeAddress:string): Promise<any>
{
  const txn = await safeService.getAllTransactions(safeAddress).then(console.log);
  return txn;
}

async function getAllSafes(ownerAddress:string): Promise<any>
{
  try{
    console.log(10);
    console.log(ownerAddress);
    const allSafes = await safeService.getSafesByOwner("gor:" + ownerAddress);
    return allSafes;
  }
  catch(err)
  {
    console.log(err);
  }
}
async function getSafeInfo(safeAddress:string): Promise<any>
{
  try{
    const response = await safeService.getSafeInfo(safeAddress);
    return response;
  }
  catch(err)
  {
    console.log(err);
  }
}

// getAllSafes('0x08F928415B86f2425c0d9972307bda1072313b3d').then(console.log);

// console.log(getAllTxn(safeAddress));

// getSafeInfo('0xB20fF5bC0E44eAcEfc3490Cc02d2578Bb4250952').then(console.log);


// --------------------Make all the requests below--------------------------

app.get('/', (req,res) =>{
  const hello = 'Hello there !';
  console.log(hello);
  res.status(200).send(hello);
})
app.put('/getAllSafes',async (req,res)=>{
  try{
    console.log(10054);
    var body_data = req.body;
    console.log(body_data['ownerAddress'].toString());
    const safes = await getAllSafes(body_data['ownerAddress'].toString());
    // console.log(safes);
    res.status(200).json(safes);
    // res.status(200).send(safes);
  }catch(err){
    console.log(err);
    res.status(400).send('Error Getting safes!');
  }
})

app.put('/getSafeInfo',async(req,res)=>{
  try {
    // console.log(req.body.safeAddress);
    const info = await getSafeInfo(req.body['safeAddress']);
    console.log(info);
    res.status(200).json(info);
    
  } catch (error) {
    console.log(error);
    res.status(400).send('Error getting Safe info')
  }
})

app.listen('8080', function () {
  console.log('Started');
});


// // Testing the api kit 


// const getSafesbyOwner = async (): Promise<any> =>{
//   const response = await safeService.getSafesByOwner(safeOwner).then(console.log);
//   return response;
// }




// // const safeFactory = await SafeFactory.create({ ethAdapter })

// // const safeSdk = await Safe.create({ ethAdapter, safeAddress})
// // var safes = getSafesbyOwner();
// // console.log(getSafeInfo());
