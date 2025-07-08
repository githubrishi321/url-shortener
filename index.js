const express = require('express');
// This line imports the Express library.
const path = require('path')
const cookieParser = require("cookie-parser");
const {restrictToLoggedinUserOnly , checkAuth} = require('./middlewares/auth')
const { connectToMongoDB } = require("./connect");

const URL = require('./models/url');


const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter")
const userRoute = require('./routes/user')


const app = express();
const PORT = 8001;

// ✅ Fixed MongoDB connection string
connectToMongoDB('mongodb://localhost:27017/short-url').then(() => {
  console.log("Mongodb is connected");
});


app.set("view engine" , "ejs");

app.set("views" , path.resolve("./views"));






// Middleware to parse JSON
app.use(express.json());

app.use(express.urlencoded({extended: false}))

app.use(cookieParser());



// Mount all /url routes from urlRoute file
app.use("/url", urlRoute);

app.use("/user" , userRoute )

app.use("/" , checkAuth , staticRoute);






// ✅ Changed from app.use() to app.get()
// ✅ Added check to prevent crash if shortId is invalid
app.get('/:shortId', async (req, res) => {
  const shortId = req.params.shortId;

  const entry = await URL.findOneAndUpdate(
    { shortId },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        }
      }
    }
  );

  if (!entry) {
    return res.status(404).send("Short URL not found");
  }

  res.redirect(entry.redirectURL);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is Started at PORT:${PORT}`);
});
