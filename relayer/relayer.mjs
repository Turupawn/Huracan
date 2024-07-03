import fs from "fs"
import cors from "cors"
import express from "express"
import { ethers } from 'ethers';

const app = express()
app.use(cors())

const JSON_CONTRACT_PATH = "./json_abi/Huracan.json"
const CHAIN_ID = "534351"
const PORT = 8080
var contract
var provider
var signer

const { RPC_URL, HURACAN_ADDRESS, RELAYER_PRIVATE_KEY, RELAYER_ADDRESS } = process.env;

const loadContract = async (data) => {
  data = JSON.parse(data);
  contract = new ethers.Contract(HURACAN_ADDRESS, data, signer);
}

async function initAPI() {
  provider = new ethers.JsonRpcProvider(RPC_URL);
  signer = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

  fs.readFile(JSON_CONTRACT_PATH, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    loadContract(data)
  });

  app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
  })
}

async function relayMessage(pA, pB, pC, publicSignals)
{
  console.log(pA)
  console.log(pB)
  console.log(pC)
  console.log(publicSignals)
  const transaction = {
    from: RELAYER_ADDRESS,
    to: HURACAN_ADDRESS,
    value: '0',
    gasPrice: "700000000", // 0.7 gwei
    nonce: await provider.getTransactionCount(RELAYER_ADDRESS),
    chainId: CHAIN_ID,
    data: contract.interface.encodeFunctionData(
      "withdraw",[pA, pB, pC, publicSignals]
    )
  };
  const signedTransaction = await signer.populateTransaction(transaction);
  const transactionResponse = await signer.sendTransaction(signedTransaction);
  console.log('🎉 The hash of your transaction is:', transactionResponse.hash);
}

app.get('/relay', (req, res) => {
  console.log(req)
  var pA = req.query["pA"].split(',')
  var pBTemp = req.query["pB"].split(',')
  const pB = [
    [pBTemp[0], pBTemp[1]],
    [pBTemp[2], pBTemp[3]]
  ];
  var pC = req.query["pC"].split(',')
  var publicSignals = req.query["publicSignals"].split(',')

  relayMessage(pA, pB, pC, publicSignals)

  res.setHeader('Content-Type', 'application/json');
  res.send({
    "message": "the proof was relayed"
  })
})

initAPI()