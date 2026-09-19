const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.CONNECTION_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Database connection
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    // Database & Collection select korun
    const db = client.db("visitorDB");
    const visitorCollection = db.collection("visitors");

    // Next.js page theke trigger hobar জন্য API Route
    app.post('/api/visit', async (req, res) => {
      try {
        // pageName: 'home' document-e count 1 barabe (na thakle new create korbe)
        const result = await visitorCollection.findOneAndUpdate(
          { pageName: 'home' },
          { $inc: { count: 1 } },
          { upsert: true, returnDocument: 'after' }
        );

        res.status(200).json({ 
          success: true, 
          message: 'Visit counted!', 
          count: result.count 
        });
      } catch (error) {
        console.error("Database update error:", error);
        res.status(500).json({ success: false, error: 'Server error' });
      }
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
  // client.close() shudhu app bondho hole dorkar, ekhane close kora jabe na
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running...');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
