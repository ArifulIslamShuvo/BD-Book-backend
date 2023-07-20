const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

const cors = require("cors");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@bd-book.asom2df.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("BD-book-catalog");
    const bookCollection = db.collection("books");
    console.log("DB connect successfully! ");

    // API
    app.get("/books", async (req, res) => {
      const cursor = bookCollection.find({});
      const books = await cursor.toArray();
      res.send(books);
    });

    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: new ObjectId(id) });
      console.log(result);
      res.send(result);
    });
    app.post('/review/:id', async (req, res) => {
      const bookId = req.params.id;
      const review = req.body.review;

      const result = await bookCollection.updateOne(
        { _id: new ObjectId(bookId) },
        { $push: { reviews: review } }
      );

      if (result.modifiedCount !== 1) {
        res.json({ error: 'Book not found or review not added' });
        return;
      }

      res.json({ message: 'review added successfully' });
    });

    app.get('/review/:id', async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: new ObjectId(bookId) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Book not found' });
      }
    });


  } finally {
    
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("BD-book!");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
