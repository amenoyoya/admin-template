const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new Schema({
  text: {type: String, required: true},
});

module.exports = mongoose.model('note', noteSchema);