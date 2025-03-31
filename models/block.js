const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  hash: String,
  nonce: String,
  transaction_index: String,
  from_address: String,
  from_address_label: String,
  to_address: String,
  to_address_label: String,
  value: String,
  gas: String,
  gas_price: String,
  input: String,
  receipt_cumulative_gas_used: String,
  receipt_gas_used: String,
  receipt_contract_address: String,
  receipt_root: String,
  receipt_status: String,
  block_timestamp: String, // Keep as string or convert to Date
  block_number: String,
  block_hash: String,
  transfer_index: [Number], // Array of numbers
  logs: [mongoose.Schema.Types.Mixed], // Flexible schema for logs
  transaction_fee: String
});

const blockSchema = new mongoose.Schema({
  number: String,
  hash: String,
  parentHash: String,
  timestamp: String, // Changed from Number to String to match ISO format
  difficulty: String,
  gasLimit: String,
  gasUsed: String,
  miner: String,
  extraData: String,
  size: Number,
  stateRoot: String,
  transactionsRoot: String,
  receiptsRoot: String,
  logsBloom: String,
  totalDifficulty: String,
  uncles: [String],
  transactions: [transactionSchema] // Changed to array of transaction objects
});

module.exports = mongoose.model('Block', blockSchema);