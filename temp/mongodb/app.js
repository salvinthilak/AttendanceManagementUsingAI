const express = require("express");
const { ObjectId } = require("mongodb");
const { connectToDb, getDb } = require("./db");

const app = express();
app.use(express.json());

//db connection
let db;
connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("App listerning on Port :3000");
    });
    db = getDb();
  }
});

//route connections
app.get("/books", (req, res) => {
  // current pages
  const page = req.query.p || 0;
  const booksPerPage = 2;

  let books = [];
  db.collection("books")
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch(() => {
      res.status(500).json({ error: "Couldn't fetch the documents" });
    });
});

app.get("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .findOne({ _id: new ObjectId().valueOf })
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ error: "could not fetch the document" });
      });
  } else {
    res.status(500).json({ error: "Not a valid Doc id" });
  }
});

app.post("/books", (req, res) => {
  const book = req.body;
  db.collection("books")
    .insertOne(book)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Couldn't do tht" });
    });
});

app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: "could not delete the document" });
      });
  } else {
    res.status(500).json({ error: "Not a valid Doc id" });
  }
});

app.patch("/books/:id", (req, res) => {
  const updates = req.body;
  if (ObjectId.isValid(req.params.id)) {
    db.collection("books")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ error: "could not update the document" });
      });
  } else {
    res.status(500).json({ error: "Not a valid Doc id" });
  }
});

//creating user email schema
const registration = {
  regNo: String,
  userName: String,
  email: String,
  password: String,
};
const reg = mongodb;
app.post("/", (req, res) => {
  res.sendFile(__dirname + "/user_login.html");
});
