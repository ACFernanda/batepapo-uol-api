import express, { json } from "express";
import cors from "cors";
import chalk from "chalk";
import dotenv from "dotenv";
import dayjs from "dayjs";
import joi from "joi";
import bcrypt from "bcrypt";
dotenv.config();

import { MongoClient, ObjectId } from "mongodb";

const app = express();
app.use(cors());
app.use(json());

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);
const connection = mongoClient.connect();
connection.then(() => {
  db = mongoClient.db("mywallet");
  console.log(chalk.bold.green("Banco de dados conectado."));
});
connection.catch((e) =>
  console.log(chalk.bold.red("Erro ao conectar ao banco de dados"), e)
);

// nome, email, senha - "confirmar senha" checar no FRONT
// fazer validação pra ver se o e-mail já existe
app.post("/sign-up", async (req, res) => {
  const signupInfo = req.body;
  const signupInfoSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().required(),
  });

  const { error } = signupInfoSchema.validate(signupInfo, {
    abortEarly: false,
  });
  if (error) {
    res.status(422).send(error.details.map((detail) => detail.message));
    return;
  }

  try {
    const encryptedPassword = bcrypt.hashSync(signupInfo.senha, 10);
    await db
      .collection("users")
      .insertOne({ ...signupInfo, senha: encryptedPassword });
    res.sendStatus(201);
  } catch (e) {
    res.sendStatus(500);
    console.log("Erro ao registrar", e);
  }
});

// email, senha
app.post("/sign-in", async (req, res) => {
  const login = req.body;
  const loginSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required(),
  });

  const { error } = loginSchema.validate(login, { abortEarly: false });
  if (error) {
    res.status(422).send(error.details.map((detail) => detail.message));
    return;
  }

  try {
    const user = await db.collection("users").findOne({ email: login.email });
    if (user && bcrypt.compareSync(login.senha, user.senha)) {
      res.send(user);
    } else res.sendStatus(404);
  } catch (e) {
    res.sendStatus(500);
    console.log("Erro ao entrar no app", e);
  }

  if (user) {
    // sucesso, usuário encontrado com este email e senha!
  } else {
    // usuário não encontrado (email ou senha incorretos)
  }
});

// REVISAR O QUE TEM NO .ENV
const port = process.env.PORT;
app.listen(port, () => {
  console.log(chalk.bold.green(`Running on http://localhost:${port}`));
});
