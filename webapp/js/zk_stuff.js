async function getMerklePath(leaves) {
  if (leaves.length === 0) {
    throw new Error('Leaves array is empty');
  }

  let layers = [leaves];

  // Build the Merkle tree
  while (layers[layers.length - 1].length > 1) {
    const currentLayer = layers[layers.length - 1];
    const nextLayer = [];

    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      const right = currentLayer[i + 1] ? currentLayer[i + 1] : left; // Handle odd number of nodes
      nextLayer.push(await poseidonContract.methods.poseidon([left,right]).call())
    }
    layers.push(nextLayer);
  }

  const root = layers[layers.length - 1][0];

  function getPath(leafIndex) {
    let pathElements = [];
    let pathIndices = [];
    let currentIndex = leafIndex;

    for (let i = 0; i < layers.length - 1; i++) {
      const currentLayer = layers[i];
      const isLeftNode = currentIndex % 2 === 0;
      const siblingIndex = isLeftNode ? currentIndex + 1 : currentIndex - 1;

      pathIndices.push(isLeftNode ? 0 : 1);
      pathElements.push(siblingIndex < currentLayer.length ? currentLayer[siblingIndex] : currentLayer[currentIndex]);

      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      PathElements: pathElements,
      PathIndices: pathIndices
    };
  }

  // You can get the path for any leaf index by calling getPath(leafIndex)
  return {
    getMerklePathForLeaf: getPath,
    root: root
  };
}

function addressToUint(address) {
  const hexString = address.replace(/^0x/, '');
  const uint = BigInt('0x' + hexString);
  return uint;
}

async function getWithdrawalProof(index, privateKey, nullifier, recipient, root) {
  let merklePath = await getMerklePath(leaves)
  let pathElements = merklePath.getMerklePathForLeaf(index).PathElements;
  let pathIndices = merklePath.getMerklePathForLeaf(index).PathIndices;
  let proverParams = {
    "privateKey": privateKey,
    "nullifier": nullifier,
    "recipient": addressToUint(recipient),
    "root": root,
    "pathElements": pathElements,
    "pathIndices": pathIndices
  }

  const { proof, publicSignals } = await snarkjs.groth16.fullProve( 
    proverParams, 
    "../zk_artifacts/proveWithdrawal.wasm", "../zk_artifacts/proveWithdrawal_final.zkey"
  );

  let pA = proof.pi_a
  pA.pop()
  let pB = proof.pi_b
  pB.pop()
  let pC = proof.pi_c
  pC.pop()

  document.getElementById("web3_message").textContent="Proof generated please confirm transaction.";

  return {
    pA: pA,
    pB: pB,
    pC: pC,
    publicSignals: publicSignals
  }
}