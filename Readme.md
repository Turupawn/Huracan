# 🌀Huracán

Fully functional privacy application on ethereum built with the minimum amount of code. Designed to serve as an educational resource for devs and engineer learning about Zero Knowledge.

| Feature | Supported |
|----------|------------ |
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

### Step 1. TODO
