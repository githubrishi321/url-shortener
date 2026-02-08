const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { setUser } = require("../service/auth");

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;

  // Hash the password before saving
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await User.create({
    name,
    email,
    password: hashedPassword,
  });
  return res.redirect("/dashboard");
}

async function handleUserLogin(req, res) {
  console.log("Login request body:", req.body);
  const { email, password } = req.body;

  // Find user by email only
  const user = await User.findOne({ email });
  console.log("User lookup result:", user);

  if (!user) {
    console.log("Invalid login attempt for email:", email);
    return res.render("login", {
      error: "Invalid Username or Password",
    });
  }

  // Compare the provided password with the hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    console.log("Invalid password for email:", email);
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
  return res.redirect("/dashboard");
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
};