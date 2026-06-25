const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();

    const db = client.db("promptly");
    const promptCollection = db.collection("prompts");
    const userCollection = db.collection("user");

    app.post("/api/prompts", async (req, res) => {
      const data = req.body;
      const promptInfo = {
        ...data,
        createdAt: new Date(),
      };
      const result = await promptCollection.insertOne(promptInfo);
      res.send(result);
    });

    app.get("/api/prompts/:id", async (req, res) => {
      const id = req.params.id;

      const query = {
        userId: id,
      };
      const result = await promptCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/api/prompt/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const result = await promptCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );
      res.send(result);
    });

    app.delete("/api/prompt/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await promptCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/api/prompts", async (req, res) => {
      const query = {};
      if (req.query.status) {
        query.status = req.query.status;
      }

      const cursor = promptCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/api/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.patch("/api/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const result = await userCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );
      res.send(result);
    });

    app.delete("/api/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
