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
    app.post("/books", async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.send(result);
    });

    app.get("/book", async (req, res) => {
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

     app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const result = await bookCollection.deleteOne({ _id: new ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.patch("/book/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body; // Data to update the book

      try {
        const result = await bookCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Book updated successfully" });
        } else {
          res.status(404).json({ error: "Book not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Failed to update book" });
      }
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
