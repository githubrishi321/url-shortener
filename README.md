# url-shortener
A full-stack URL shortener web application built using **Node.js**, **Express**, **MongoDB**, **EJS**, and **Bootstrap**. Authenticated users can generate and manage short URLs, track click analytics, and more — all in a clean, responsive interface.

## 🚀 Features

- ✅ User Signup & Login (Session-based Authentication)
- 🔐 Route protection using middleware
- ✂️ URL shortening using unique `shortid`
- 📊 Click tracking with visit analytics
- 📋 List of all shortened URLs for logged-in users
- 📱 Fully responsive UI with Bootstrap 5
- 🔗 Copy-to-clipboard button for generated short URLs

## 📸 Screenshots

> Add screenshots in a `screenshots/` folder for better preview

| Home Page (Logged In) | Short URL Copy Feature |
|-----------------------|------------------------|
| ![Home](screenshots/home.png) | ![Copy](screenshots/copy.png) |

## 🛠️ Tech Stack

| Tech          | Role                      |
|---------------|---------------------------|
| **Node.js**   | Backend runtime           |
| **Express.js**| Web framework             |
| **MongoDB**   | Database                  |
| **Mongoose**  | MongoDB ODM               |
| **EJS**       | Templating engine         |
| **Bootstrap** | Responsive styling        |
| **shortid**   | Unique short URL generator |
| **cookie-parser** | Cookie-based session auth |

## 📂 Project Structure
.
├── controllers/
│ └── url.js
├── middlewares/
│ └── auth.js
├── models/
│ └── url.js
├── routes/
│ ├── url.js
│ ├── user.js
│ └── staticRouter.js
├── service/
│ └── auth.js
├── views/
│ ├── home.ejs
│ ├── login.ejs
│ └── signup.ejs
├── connect.js
├── index.js
├── package.json
└── README.md
