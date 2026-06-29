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
    const reviewCollection = db.collection("reviews");
    const sessionCollection = db.collection("session");
    const paymentCollection = db.collection("payments");

    // verification
    const verifyToken = async (req, res, next) => {
      const authHeader = req.headers?.authorization;
      if (!authHeader) {
        return res.status(401).send({ message: "unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).send({ message: "unauthorized" });
      }

      const query = { token: token };
      const session = await sessionCollection.findOne(query);
      console.log(session);

      const userId = session.userId;

      const userQuery = {
        _id: userId,
      };
      const user = await usersCollection.findOne(userQuery);
      console.log("user of the session:", user);

      // Set data in the req object
      req.user = user;
      next();
    };

    const verifyUser = async (req, res, next) => {
      if (req.user?.role !== "user") {
        return res.status(403).send({ message: "forbidden" });
      }
      next();
    };

    const verifyCreator = async (req, res, next) => {
      if (req.user?.role !== "creator") {
        return res.status(403).send({ message: "forbidden" });
      }
      next();
    };

    const verifyAdmin = async (req, res, next) => {
      if (req.user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden" });
      }
      next();
    };

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

    app.post("/api/reviews", async (req, res) => {
      const data = req.body;
      const reviewData = {
        ...data,
        createdAt: new Date(),
      };
      const result = await reviewCollection.insertOne(reviewData);
      res.send(result);
    });

    app.get("/api/pid/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection
        .find({
          promptId: id,
        })
        .toArray();
      res.send(result);
    });

    app.get("/api/uid/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewCollection
        .find({
          userId: id,
        })
        .toArray();
      res.send(result);
    });

    app.post("/api/payment", async (req, res) => {
      const data = req.body;
      const paymentData = {
        ...data,
        createdAt: new Date(),
      };
      if (data.userId) {
        const result = await userCollection.updateOne(
          { _id: new ObjectId(data.userId) },
          { $set: { plan: "Pro" } },
        );
      }
      const result = await paymentCollection.insertOne(paymentData);
      res.send(result);
    });

    app.get("/api/payments", async (req, res) => {
      const result = await paymentCollection.find().toArray();
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
