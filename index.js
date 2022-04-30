import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import dayjs from "dayjs";
import joi from "joi";
dotenv.config();

import { MongoClient } from "mongodb";

const app = express();
app.use(cors());
app.use(json());

const mongoClient = new MongoClient(process.env.MONGO_URI); // COLOCAR ISSO DENTRO DE CADA REQUISIÇÃO

app.post("/participants", async (req, res) => {
  const { name } = req.body;

  const participantSchema = joi.object({
    name: joi.string().required(),
  });

  const validation = participantSchema.validate(req.body);

  if (validation.error) {
    res.sendStatus(422);
    return;
  }

  try {
    await mongoClient.connect();
    const db = mongoClient.db("batepapo_uol");

    const participantExists = await db
      .collection("participants")
      .findOne({ name: name });

    if (participantExists) {
      res.status(409).send("Nome de usuário já está sendo utilizado.");
      return;
    }

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

app.post("/status", async (req, res) => {
  const { user } = req.headers;
  try {
    await mongoClient.connect();
    const db = mongoClient.db("batepapo_uol");
    const participantsCollection = db.collection("participants");
    const participant = await participantsCollection.findOne({
      name: user,
    });

    if (!participant) {
      res.sendStatus(404);
      mongoClient.close();
      return;
    }

    await participantsCollection.updateOne(participant, {
      $set: { lastStatus: Date.now() },
    });

    res.sendStatus(200);
    mongoClient.close();
  } catch (error) {
    res.status(500).send(error);
    mongoClient.close();
  }
});

app.listen(5000, () => {
  console.log(chalk.bold.green("Running on http://localhost:5000"));
});
