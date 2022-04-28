import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import dayjs from "dayjs";
dotenv.config();

import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(json());

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);

app.post("/participants", async (req, res) => {
  const { name } = req.body;
  try {
    await mongoClient.connect();
    const db = mongoClient.db("batepapo_uol");

    await db.collection("participants").insertOne({
      name: name,
      lastStatus: Date.now(),
    });

    await db.collection("messages").insertOne({
      from: name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs().format("HH:mm:ss"),
    });

    res.sendStatus(201);
    mongoClient.close();
  } catch (e) {
    res.status(500).send(e);
    mongoClient.close();
  }
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
    res.status(500).send("Não foi possível encontrar os participantes.");
    mongoClient.close();
  }
});

app.post("/messages", (req, res) => {
  res.send("post messages");
});

app.get("/messages", async (req, res) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("batepapo_uol");
    const messagesCollection = db.collection("messages");
    const messages = await messagesCollection.find({}).toArray();

    res.send(messages);
    mongoClient.close();
  } catch (e) {
    res.status(500).send("Não foi possível encontrar as mensagens.");
    mongoClient.close();
  }
});

app.post("/status", (req, res) => {
  res.send("post status");
});

app.listen(5000, () => {
  console.log(chalk.bold.green("Running on http://localhost:5000"));
});
