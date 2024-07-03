pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

template switchPosition() {
    signal input in[2];
    signal input s;
    signal output out[2];

    s * (1 - s) === 0;
    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

template commitmentHasher() {
    signal input privateKey;
    signal input nullifier;
    signal output commitment;
    signal output nullifierHash;
    component commitmentHashComponent;
    commitmentHashComponent = Poseidon(2);
    commitmentHashComponent.inputs[0] <== privateKey;
    commitmentHashComponent.inputs[1] <== nullifier;
    commitment <== commitmentHashComponent.out;
    component nullifierHashComponent;
    nullifierHashComponent = Poseidon(1);
    nullifierHashComponent.inputs[0] <== nullifier;
    nullifierHash <== nullifierHashComponent.out;
}

template proveWithdrawal(levels) {
    signal input root;
    signal input recipient;
    signal input privateKey;
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output nullifierHash;

    signal leaf;
    component commitmentHasherComponent;
    commitmentHasherComponent = commitmentHasher();
    commitmentHasherComponent.privateKey <== privateKey;
    commitmentHasherComponent.nullifier <== nullifier;
    leaf <== commitmentHasherComponent.commitment;
    nullifierHash <== commitmentHasherComponent.nullifierHash;

    component selectors[levels];
    component hashers[levels];

    signal computedPath[levels];

    for (var i = 0; i < levels; i++) {
        selectors[i] = switchPosition();
        selectors[i].in[0] <== i == 0 ? leaf : computedPath[i - 1];
        selectors[i].in[1] <== pathElements[i];
        selectors[i].s <== pathIndices[i];

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== selectors[i].out[0];
        hashers[i].inputs[1] <== selectors[i].out[1];
        computedPath[i] <== hashers[i].out;
    }
    root === computedPath[levels - 1];
}

component main {public [root, recipient]} = proveWithdrawal(2);