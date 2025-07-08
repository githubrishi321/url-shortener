const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const { setUser } = require("../service/auth");

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;
  await User.create({
    name,
    email,
    password,
  });
  return res.redirect("/");
}

async function handleUserLogin(req, res) {
  console.log("Login request body:", req.body);
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  console.log("User lookup result:", user);

  if (!user) {
    console.log("Invalid login attempt for email:", email);
    return res.render("login", {
      error: "Invalid Username or Password",
    });
  }

  const sessionId = uuidv4();
  console.log("Generated sessionId:", sessionId);
  setUser(sessionId, user);
  console.log("setUser called for sessionId:", sessionId);
  res.cookie("uid", sessionId, { httpOnly: true, path: "/" });
  console.log("Cookie set for uid:", sessionId);
  return res.redirect("/");
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
};