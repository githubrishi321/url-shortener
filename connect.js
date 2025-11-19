// connect.js
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

let cached = global._mongooseConnection;

async function connectToMongoDB(uri) {
  // fallbacks for env var name differences
  const envUri = uri || process.env.MONGODB_URI || process.env.MONGO_URI;
  const mongoURL = envUri || 'mongodb://127.0.0.1:27017/short-url';

  if (cached) return cached;

  // Do not pass deprecated options for mongoose v6+
  cached = mongoose.connect(mongoURL);
  global._mongooseConnection = cached;
  return cached;
}

module.exports = { connectToMongoDB };
