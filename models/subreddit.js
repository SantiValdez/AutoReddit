const mongoose = require("mongoose");

const subredditSchema = new mongoose.Schema({
    name: String,
    tags: [String],
    posts: [{}]
});

const Subreddit = mongoose.model("Subreddit", subredditSchema);

module.exports = Subreddit;