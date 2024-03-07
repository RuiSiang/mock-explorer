const crypto = require('crypto');

const generateHex = (length) => crypto.randomBytes(length).toString('hex');
const generateAddress = () => `addr_${generateHex(3)}`;
const generateTxId = () => `tx_${generateHex(4)}`;
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
let currentTimestamp = new Date(); 

const generateTimestamp = () => {
  const newTimestamp = new Date(currentTimestamp.getTime() + getRandomInt(1000, 60000)); 
  currentTimestamp = newTimestamp; 
  return newTimestamp.toISOString();
};
let addressBalances = {};
let spentOutputs = new Map(); 

const createCoinbaseTransaction = () => {
  const address = generateAddress();
  const txid = generateTxId();
  const amount = 200; 
  addressBalances[address] = (addressBalances[address] || 0) + amount;
  return {
    txid: txid,
    timestamp: generateTimestamp(),
    inputs: [],
    outputs: [{
      address: address,
      amount: amount,
    }],
  };
};

const selectInputs = (amountNeeded) => {
  const inputs = [];
  let totalSelected = 0;

  for (const [txid, { address, amount }] of spentOutputs) {
    if (totalSelected >= amountNeeded) break; 
    inputs.push({ txid, address });
    totalSelected += amount;
    spentOutputs.delete(txid); 
  }

  return { inputs, totalSelected };
};

const generateTransaction = () => {
  const txid = generateTxId();
  const amountNeeded = getRandomInt(1, 1000); 
  const { inputs, totalSelected } = selectInputs(amountNeeded);
  if (inputs.length === 0) return null; 

  const outputs = [];
  const remainingAmount = totalSelected - amountNeeded; 
  outputs.push({ address: generateAddress(), amount: amountNeeded }); 
  if (remainingAmount > 0) {
    const changeAddress = generateAddress(); 
    outputs.push({ address: changeAddress, amount: remainingAmount });
  }

  outputs.forEach(output => {
    spentOutputs.set(txid, { address: output.address, amount: output.amount });
  });

  return {
    txid, timestamp: generateTimestamp(), inputs, outputs
  };
};

const generateTransactions = (numTransactions) => {
  const transactions = [];
  for (let i = 0; i < numTransactions; i++) {
    if (i % 5 === 0 || i === 0) { 
      const coinbaseTx = createCoinbaseTransaction();
      transactions.push(coinbaseTx);

      coinbaseTx.outputs.forEach(output => {
        spentOutputs.set(coinbaseTx.txid, { address: output.address, amount: output.amount });
      });
    } else {
      const transaction = generateTransaction();
      if (transaction) transactions.push(transaction);
    }
  }
  return transactions;
};

const numTransactions = 200;
console.log(JSON.stringify(generateTransactions(numTransactions)));