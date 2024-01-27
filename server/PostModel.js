const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  comment: Number,
  like: Number,
  timestamp: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

