// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Meme } = require("./model");
const { ethers, parseEther, Contract } = require("ethers");
const CONTRACT = require("./MemeTrue.json");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize ethers.js provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // Add your RPC URL to .env
const relayerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Add your private key to .env

const contractAddress = "0xf197A93dFf8a9d1b6275C28F83De9EC86322ac87";
const contractABI = CONTRACT.abi;

// Create - GET Health Check
app.get("/api/health", async (req, res) => {
  try {
    res.status(201).json("Healthy");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Relay Transaction Route
app.post("/api/relay", async (req, res) => {
  const { userAddress, marketId, voteYes } = req.body;

  if (!userAddress || marketId === undefined || voteYes === undefined) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // Initialize the contract instance
    const contract = new Contract(contractAddress, contractABI, relayerWallet);

    // Estimate the gas required for the transaction
    const voteCost = parseEther("0.001"); // Replace with actual voteCost from your contract
    
    const gasLimit = await contract.vote.estimateGas(userAddress, marketId, voteYes, {
      value: voteCost
    });

    
    // Send the transaction
    const txResponse = await contract.vote(userAddress, marketId, voteYes, {
      value: voteCost,
      gasLimit: gasLimit
    });

    console.log("Transaction sent:", txResponse.hash);

    // // Wait for the transaction to be mined
    // const receipt = await txResponse.wait();
    // console.log("Transaction mined:", receipt.transactionHash);

    res.json({
      message: "Vote relayed successfully",
      txHash: receipt.transactionHash
    });
  } catch (error) {
    console.error("Error relaying vote:", error);
    res.status(500).json({ message: "Failed to relay vote", error: error.message });
  }
});

// Existing Routes
app.post("/api/memes", async (req, res) => {
  try {
    const meme = new Meme(req.body);
    await meme.save();
    res.status(201).json(meme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/memes", async (req, res) => {
  try {
    const memes = await Meme.find().sort({ createdAt: -1 });
    res.json(memes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/memes/:templateId", async (req, res) => {
  try {
    const { templateId } = req.params;
    const memes = await Meme.find({ memeTemplate: templateId });

    if (memes.length === 0) {
      return res
        .status(404)
        .json({ message: "No memes found for this template" });
    }

    res.json(memes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/memes/:id", async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id);
    if (!meme) {
      return res.status(404).json({ message: "Meme not found" });
    }
    res.json(meme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/memes/:id", async (req, res) => {
  try {
    const meme = await Meme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!meme) {
      return res.status(404).json({ message: "Meme not found" });
    }
    res.json(meme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/memes/:id", async (req, res) => {
  try {
    const meme = await Meme.findByIdAndDelete(req.params.id);
    if (!meme) {
      return res.status(404).json({ message: "Meme not found" });
    }
    res.json({ message: "Meme deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
