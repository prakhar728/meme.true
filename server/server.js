// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Meme } = require("./model");
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

// Create - GET Health Check
app.get("/api/health", async (req, res) => {
  try {

    res.status(201).json("Healthy");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create - POST /api/memes
app.post("/api/memes", async (req, res) => {
  try {
    const meme = new Meme(req.body);
    
    await meme.save();
    res.status(201).json(meme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read All - GET /api/memes
app.get("/api/memes", async (req, res) => {
  try {
    const memes = await Meme.find().sort({ createdAt: -1 });
    res.json(memes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to fetch memes by template
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

// Read One - GET /api/memes/:id
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

// Update - PUT /api/memes/:id
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

// Delete - DELETE /api/memes/:id
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
