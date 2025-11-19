const mongoose = require('mongoose');
mongoose.set('strictQuery', true);

let cached = global._mongooseConnection;

async function connectToMongoDB(uri) {
  const mongoURL = uri || process.env.MONGODB_URI;

  if (cached) return cached;

  cached = mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  global._mongooseConnection = cached;
  return cached;
}

module.exports = { connectToMongoDB };
