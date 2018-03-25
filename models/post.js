const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: String,
    url: String,
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;