const mongoose              = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    subreddits: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subreddit"
        }
    ]
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
