const mongoose = require("mongoose");

const subredditSchema = new mongoose.Schema({
    name: String,
    tags: [String],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
});

const Subreddit = mongoose.model("Subreddit", subredditSchema);

module.exports = Subreddit;