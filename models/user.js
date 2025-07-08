const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // ✅ Moved here — correct usage
);

const User = mongoose.model('User', userSchema); // ✅ Capital 'U' for consistency

module.exports = User;
