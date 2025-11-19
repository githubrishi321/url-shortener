// index.js
const app = require('./app');
const { connectToMongoDB } = require('./connect');

const PORT = process.env.PORT || 8001;

async function start() {
  try {
    // Accept either env name
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await connectToMongoDB(uri);
    console.log('✅ Connected to MongoDB — starting server');
    app.listen(PORT, () => console.log(`Local server running on PORT ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    // For local dev it's okay to exit; if you later run in serverless, remove this.
    process.exit(1);
  }
}

start();
