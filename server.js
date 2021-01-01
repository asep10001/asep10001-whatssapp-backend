//importing all the stuffs

// RB5P4nWziwP15k87
import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import Messages from "./dbMessages.js";

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1131318",
  key: "5e1f0f586658d79d6cbc",
  secret: "8d984b9fe742bd1222a5",
  cluster: "ap1",
  useTLS: true,
});

//middlewares
app.use(express.json());

app.use((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
})

//DB config
const connection_url =
  "mongodb://admin:RB5P4nWziwP15k87@cluster0-shard-00-00.rzmmf.mongodb.net:27017,cluster0-shard-00-01.rzmmf.mongodb.net:27017,cluster0-shard-00-02.rzmmf.mongodb.net:27017/asep10001-whatsappdb?ssl=true&replicaSet=atlas-alm9k3-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;

      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
      });
    } else{
        console.log('Error trigrerring pusher');
    }
  });
});

//????

//api routes
app.get("/", (req, res) => res.status(200).send("hello world"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message created: \n ${data}`);
    }
  });
});

//listener
app.listen(port, () => console.log(`Listening on localhost:${port}`));
