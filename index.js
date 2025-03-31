const express = require("express");
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const dotenv = require("dotenv");
const Block = require("./models/block");
const mongoose = require("mongoose");

dotenv.config();

const app = express();
const port = 4000;

const MORALIS_API_KEY = process.env.API_KEY; // Use your .env API key
const chain = EvmChain.ETHEREUM;

async function getLatestBlockNumber() {
  try {
    const response = await Moralis.EvmApi.block.getDateToBlock({
      chain: EvmChain.ETHEREUM,
      date: new Date().toISOString(), // Get the block closest to now
    });
    return response.toJSON().block; // Returns the block number
  } catch (error) {
    throw new Error(`Failed to fetch latest block number: ${error.message}`);
  }
}

async function getLatestBlock() {
  try {
    const latestBlockNumber = await getLatestBlockNumber();
    const response = await Moralis.EvmApi.block.getBlock({
      chain: EvmChain.ETHEREUM,
      blockNumberOrHash: latestBlockNumber.toString(),
    });
    let blockData = response.toJSON();

    // Transform data to match schema
    blockData.timestamp = blockData.timestamp || new Date().toISOString();
    blockData.transactions = blockData.transactions || [];

    return blockData;
  } catch (error) {
    throw new Error(`Failed to fetch block: ${error.message}`);
  }
}

app.get("/fetchLatestBlock", async (req, res) => {
  try {
    const blockData = await getLatestBlock();

    const newBlock = new Block(blockData);
    await newBlock.save();

    res.status(200).send("Block saved successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/getLatestBlock", async (req, res) => {
  try {
    const latestBlock = await Block.find().sort({ timestamp: -1 }).limit(1).exec();
    if (!latestBlock || latestBlock.length === 0) {
      return res.status(404).json({ error: "No blocks found in database" });
    }
    res.status(200).json(latestBlock[0]);
  } catch (error) {
    console.error("MongoDB query error:", error);
    res.status(500).json({ error: error.message });
  }
});

const startServer = async () => {
  await Moralis.start({
    apiKey: MORALIS_API_KEY,
  }).then(() => {
    console.log("Moralis started");
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000 // Increase timeout
    }).then(() => {
      console.log('MongoDB connected successfully');
      app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
      });
    }).catch((mongoError) => {
      console.error("MongoDB connection error:", mongoError);
    });
  }).catch((error) => {
    console.error("Failed to start Moralis:", error);
  });
};

startServer();