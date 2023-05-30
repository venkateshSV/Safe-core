"use strict";
// creating a ethers instance
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const ethers_1 = require("ethers");
const protocol_kit_1 = __importStar(require("@safe-global/protocol-kit"));
const api_kit_1 = __importDefault(require("@safe-global/api-kit"));
const protocol_kit_2 = require("@safe-global/protocol-kit");
require('dotenv').config();
const RPC_URL = 'https://eth-goerli.public.blastapi.io';
const provider = new ethers_1.ethers.providers.JsonRpcProvider(RPC_URL);
const txServiceUrl = 'https://safe-transaction-goerli.safe.global';
const safeAddress = '0xB20fF5bC0E44eAcEfc3490Cc02d2578Bb4250952'; // test-safe
var app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*'
}));
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
// ----------------------Make all the functions below------------------
// Initialize signers
// console.log(10);
const owner1Signer = new ethers_1.ethers.Wallet(process.env.OWNER_1_PRIVATE_KEY, provider);
// console.log(owner1Signer);
const ethAdapterOwner1 = new protocol_kit_1.EthersAdapter({
    ethers: ethers_1.ethers,
    signerOrProvider: owner1Signer
});
const safeService = new api_kit_1.default({ txServiceUrl, ethAdapter: ethAdapterOwner1 });
let baseNonce = provider.getTransactionCount(new ethers_1.ethers.Wallet(process.env.OWNER_1_PRIVATE_KEY, provider).address);
let nonceOffset = 0;
function getNonce() {
    return baseNonce.then((nonce) => (nonce + (nonceOffset++)));
}
// var nonce_updated = getNonce().then(console.log);
async function deploySafe(threshold) {
    const safeAccountConfig = {
        owners: [
            await owner1Signer.getAddress(),
        ],
        threshold: 1,
    };
    const options = {
        gasLimit: 271619,
        nonce: 5
    };
    const chainid = await ethAdapterOwner1.getChainId().then(console.log);
    console.log(chainid);
    const safeFactory = await protocol_kit_2.SafeFactory.create({ ethAdapter: ethAdapterOwner1 });
    const safeSdk = await safeFactory.deploySafe({ safeAccountConfig, options });
    const safeAddress = await safeSdk.getAddress();
    console.log('Your Safe has been deployed:');
    console.log(`https://goerli.etherscan.io/address/${safeAddress}`);
    console.log(`https://app.safe.global/gor:${safeAddress}`);
}
// deploySafe(1);
async function createTransaction(to, amount) {
    const amt = ethers_1.ethers.utils.parseUnits(amount, 'ether').toString();
    const safeTransactionData = {
        to: to,
        data: '0x',
        value: amt
    };
    // Create a Safe transaction with the provided parameters
    const safeConfig = {
        ethAdapter: ethAdapterOwner1,
        safeAddress: safeAddress
    };
    const safeSdk = await protocol_kit_1.default.create(safeConfig);
    const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
    const senderSignature = await safeSdk.signTransactionHash(safeTxHash);
    await safeService.proposeTransaction({
        safeAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: await owner1Signer.getAddress(),
        senderSignature: senderSignature.data
    });
}
// createTransaction('0x517fF00d27eFE58a73969466c19af7C956066d36','0.0001');
async function confirmTransaction() {
    const pending = await safeService.getPendingTransactions(safeAddress);
    const pending_txn = await pending.results;
    const transaction = pending_txn[0];
    const safeTxHash = transaction.safeTxHash;
    const safeSdkOwner1 = await protocol_kit_1.default.create({
        ethAdapter: ethAdapterOwner1,
        safeAddress
    });
    const signature = await safeSdkOwner1.signTransactionHash(safeTxHash);
    const response = await safeService.confirmTransaction(safeTxHash, signature.data);
    return response;
}
// confirmTransaction();
async function executeTransaction() {
    const pending = await safeService.getPendingTransactions(safeAddress);
    const pending_txn = await pending.results;
    const transaction = pending_txn[0];
    const safeTxHash = transaction.safeTxHash;
    const safeSdk = await protocol_kit_1.default.create({
        ethAdapter: ethAdapterOwner1,
        safeAddress
    });
    const safeTransaction = await safeService.getTransaction(safeTxHash);
    const executeTxResponse = await safeSdk.executeTransaction(safeTransaction);
    const receipt = await executeTxResponse.transactionResponse?.wait();
    console.log('Transaction executed:');
    console.log(`https://goerli.etherscan.io/tx/${receipt?.transactionHash}`);
}
// executeTransaction();
async function getAllTxn(safeAddress) {
    const txn = await safeService.getAllTransactions(safeAddress).then(console.log);
    return txn;
}
async function getAllSafes(ownerAddress) {
    try {
        console.log(10);
        console.log(ownerAddress);
        const allSafes = await safeService.getSafesByOwner("gor:" + ownerAddress);
        return allSafes;
    }
    catch (err) {
        console.log(err);
    }
}
async function getSafeInfo(safeAddress) {
    try {
        const response = await safeService.getSafeInfo(safeAddress);
        return response;
    }
    catch (err) {
        console.log(err);
    }
}
// getAllSafes('0x08F928415B86f2425c0d9972307bda1072313b3d').then(console.log);
// console.log(getAllTxn(safeAddress));
// getSafeInfo('0xB20fF5bC0E44eAcEfc3490Cc02d2578Bb4250952').then(console.log);
// --------------------Make all the requests below--------------------------
app.get('/', (req, res) => {
    const hello = 'Hello there !';
    console.log(hello);
    res.status(200).send(hello);
});
app.put('/getAllSafes', async (req, res) => {
    try {
        console.log(10054);
        var body_data = req.body;
        console.log(body_data['ownerAddress'].toString());
        const safes = await getAllSafes(body_data['ownerAddress'].toString());
        // console.log(safes);
        res.status(200).json(safes);
        // res.status(200).send(safes);
    }
    catch (err) {
        console.log(err);
        res.status(400).send('Error Getting safes!');
    }
});
app.get('/getSafeInfo', async (req, res) => {
    try {
        // console.log(req.body.safeAddress);
        const info = await getSafeInfo(req.body.safeAddress);
        console.log(info);
        res.status(200).json(info);
    }
    catch (error) {
        console.log(error);
        res.status(400).send('Error getting Safe info');
    }
});
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
