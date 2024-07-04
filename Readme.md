# 🌀Huracán

Fully functional privacy application on ethereum built with the minimum amount of code. Designed to serve as an educational resource for devs and engineer learning about Zero Knowledge.

| Feature | Supported |
|---------|:---------:|
| Circom circuit | ✅ |
| Poseidon hash | ✅ |
| Solidity verifier | ✅ |
| Merkle tree membership proof | ✅ |
| Prover on browser (zk-WASM with snarkjs) | ✅ |
| HTML and js vanilla frontend | ✅ |
| Ethers.js 6.9 relayer | ✅ |

## How Huracán works

Huracan is a privacy DeFi application that uses a technique named _private inclusion proofs_ to create what we call a _mixer_. This system is capable of proving that a user deposited ether to a contract wihout revealing which one he is.

![Deposits in Huracan](https://github.com/Turupawn/Huracan/assets/707484/75d03db3-76ab-49eb-8f60-6cdb9d6273a2)
_Each user that deposits ether to the contract is placed in a public merkle tree on the contract state_

In order to make this possible, we need a smart contract where the funds will be deposited y when doing so a merkle tree will be generated where every leaf represents a depositant. Additionally, we will need a circuit that will generate merkle inlusion proofs that will keep the user anonymous when withdrawing the funds. And finally, we'll also run a relayer that will execute the transaction in behalf or the user so he can preserver his privacy.

![Withdraws in Huracan](https://github.com/Turupawn/Huracan/assets/707484/b93a7347-5fa0-44eb-a987-6344a4cb7156)
_Users can withdraw funds without revealing their identities_

## 🚀How to launch

### Step 1. Build the circuits

Install the dependencies.

```bash
cd circuits
git clone https://github.com/iden3/circomlib.git
```

Now do the trusted setup and generate the artifacts.

```bash
circom proveWithdrawal.circom --r1cs --wasm --sym
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup proveWithdrawal.r1cs pot12_final.ptau proveWithdrawal_0000.zkey
snarkjs zkey contribute proveWithdrawal_0000.zkey proveWithdrawal_0001.zkey --name="1st Contributor Name" -v
snarkjs zkey export verificationkey proveWithdrawal_0001.zkey verification_key.json
```

Export the artifacts to the webapp.

```bash
mkdir ../webapp/zk_artifacts
cp proveWithdrawal_0001.zkey ../webapp/zk_artifacts/proveWithdrawal_final.zkey
cp proveWithdrawal_js/proveWithdrawal.wasm ../webapp/zk_artifacts/proveWithdrawal_final.zkey
```

Finally, export the verifier.

```bash
snarkjs zkey export solidityverifier proveWithdrawal_0001.zkey verifier.sol
```

### Step 2. Deploy the contracts

Start by deploying the verifier contract now located at `circuits/verifier.sol`.

Next deploy poseidon, remember to change `YOURRPCURL` and `YOURPRIVATEKEY`.
```bash
git clone https://github.com/iden3/circomlibjs.git
node --input-type=module --eval "import { writeFileSync } from 'fs'; import('./circomlibjs/src/poseidon_gencontract.js').then(({ createCode }) => { const output = createCode(2); writeFileSync('poseidonBytecode', output); })"
cast send --rpc-url YOURRPCURL --private-key YOURPRIVATEKEY --create $(cat bytecode)
```

And finally, deploy the contract at `contracts/Huracan.sol` by passing as parameter the verifier and poseidon contract you just deployed.

### Step 3. Launch the frontend

Install a web server, I recommend `lite-server` for development purporses.

```bash
npm install -g lite-server
```

Now edit the `NETWORK_ID`, `HURACAN_ADDRESS` and `POSEIDON_ADDRESS` on `webapp/js/blockchain_stuff.js` matching the smart contracts you just deployed.

And launch the webapp.

```bash
cd webapp
lite-server
```

### Step 4. Launch the relayer

Install the relayer dependencies
```bash
cd relayer
npm install cors
```

And start the relayer by replacing the environment variables values: `YOURRPCURL`, `HURACANADDRESS`, `RELAYERPRIVATEKEY`, `YOURADDRESS`. Also remember to fund the relayer address so he can send transactions.

```
RPC_URL=YOURRPCURL HURACAN_ADDRESS=HURACANADDRESS RELAYER_PRIVATE_KEY=RELAYERPRIVATEKEY RELAYER_ADDRESS=YOURADDRESS node relayer.mjs
```