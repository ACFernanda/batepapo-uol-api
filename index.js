import express from "express";
import cors from "cors";
import chalk from "chalk";

const app = express();
app.use(cors());

app.post("/participants", (req, res) => {
  res.send("post participants");
});

app.get("/participants", (req, res) => {
  res.send("get participants");
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
