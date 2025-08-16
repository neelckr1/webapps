const mongoose = require('mongoose');

const groupchema = new mongoose.Schema({
  groupname: {
    type: String,
    required: [true, "Group name required"],
    minlength: 3,
    maxlength: 50
  },
});

module.exports = mongoose.model('groups', groupchema);
