const mongoose = require('mongoose');
mongoose.set("strictQuery" , true);

async function connectToMongoDB(url){
  return mongoose.connect("mongodb://127.0.0.1:27017/short-url");
}


module.exports = {
connectToMongoDB,
}