import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(json());

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);

app.post("/participants", (req, res) => {
  res.send("post participants");
});

app.get("/participants", async (req, res) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("batepapo_uol");
    const participantsCollection = db.collection("participants");
    const participants = await participantsCollection.find({}).toArray();

    res.send(participants);
    mongoClient.close();
  } catch (e) {
    res.status(500).send("Não foi possível encontrat os participantes.");
    mongoClient.close();
  }
});

app.post("/messages", (req, res) => {
  res.send("post messages");
});

app.get("/messages", (req, res) => {
  res.send("get messages");
});

app.post("/status", (req, res) => {
  res.send("post status");
});

app.listen(5000, () => {
  console.log(chalk.bold.green("Running on http://localhost:5000"));
});
