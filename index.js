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
    const reportedPromptsCollection = db.collection("reportedPrompts");
    const bookmarksCollection = db.collection("bookmarks");

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
      // search
      if (req.query.search) {
        query.$or = [
          { title: { $regex: req.query.search, $options: "i" } },
          { tags: { $regex: req.query.search, $options: "i" } },
          { aiTool: { $regex: req.query.search, $options: "i" } },
        ];
      }

      // filters
      if (req.query.status) {
        query.status = req.query.status;
      }
      if (req.query.category) {
        query.category = req.query.category;
      }
      if (req.query.aiTool) {
        query.aiTool = req.query.aiTool;
      }
      if (req.query.difficulty) {
        query.difficulty = req.query.difficulty;
      }

      // sort
      let sortOption = { createdAt: -1 };
      if (req.query.sort === "popular") {
        sortOption = { rating: -1 };
      }
      if (req.query.sort === "copied") {
        sortOption = { copyCount: -1 };
      }
      if (req.query.sort === "latest") {
        sortOption = { createdAt: -1 };
      }

      // pagination
      if (req.query.page) {
        const page = parseInt(req.query.page);
        const perPage = parseInt(req.query.perPage) || 10;
        const skipItems = (page - 1) * perPage;
        const total = await promptCollection.countDocuments(query);
        const cursor = promptCollection
          .find(query)
          .sort(sortOption)
          .skip(skipItems)
          .limit(perPage);
        const prompts = await cursor.toArray();
        return res.send({ total, prompts });
      }

      const result = await promptCollection
        .find(query)
        .sort(sortOption)
        .toArray();
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

    app.get("/api/prompt/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await promptCollection.findOne(query);
      res.send(result);
    });

    app.patch("/api/prompts/:id", async (req, res) => {
      const id = req.params.id;
      const result = await promptCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { copyCount: 1 } },
      );
      res.send(result);
    });

    app.post("/api/reports", async (req, res) => {
      const data = req.body;
      const reportedInfo = {
        ...data,
        createdAt: new Date(),
      };
      const result = await reportedPromptsCollection.insertOne(reportedInfo);
      res.send(result);
    });

    app.get("/api/reports", async (req, res) => {
      const result = await reportedPromptsCollection.find().toArray();
      res.send(result);
    });

    app.delete("/api/report/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      const query = {
        _id: new ObjectId(id),
      };

      if (req.body.promptId) {
        const result = await promptCollection.deleteOne({
          _id: new ObjectId(req.body.promptId),
        });
      }

      const result = await reportedPromptsCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/api/bookmark", async (req, res) => {
      const data = req.body;
      const bookmarkData = {
        ...data,
        createdAt: new Date(),
      };

      if (data.promptId) {
        const result = await promptCollection.updateOne(
          { _id: new ObjectId(data.promptId) },
          {
            $inc: {
              bookmarkCount: 1,
            },
          },
        );
      }
      const result = await bookmarksCollection.insertOne(bookmarkData);
      res.send(result);
    });

    app.get("/api/get/bookmark/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookmarksCollection.find({ userId: id }).toArray();
      res.send(result);
    });

    app.delete("/api/d/bookmark/:id", async (req, res) => {
      const id = req.params.id;
      if (req.body.promptId) {
        const result = await promptCollection.updateOne(
          { _id: new ObjectId(req.body.promptId) },
          {
            $inc: {
              bookmarkCount: -1,
            },
          },
        );
      }

      const result = await bookmarksCollection.deleteOne({
        _id: new ObjectId(id),
      });
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
