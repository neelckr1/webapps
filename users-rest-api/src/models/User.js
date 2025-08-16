const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username required"],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, "Email required"],
    unique: true,
    match: [/\S+@\S+\.\S+/, "Email invalid"]
  },
  password: {
    type: String,
    required: [true, "Password required"],
    minlength: 6
  }
});

module.exports = mongoose.model('User', userSchema);
