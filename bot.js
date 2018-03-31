require('dotenv').config({path:'./process.env'});

const   Snoowrap    = require("snoowrap"), 
        User        = require("./models/User"),
        Subreddit   = require("./models/Subreddit");

const r = new Snoowrap({
    userAgent: 'reddit tool for AutoReddit project v0.1 (by /u/HarryHayes)',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});


let bot = {

    results: {
        urls: []
    },

    search: () =>{
        //loop through all users
        User.find({}).populate("subreddits").exec((err, foundUsers) =>{
            if(err){
                console.log(err);
            } else {
                //current user
                foundUsers.forEach((user) =>{
                    // loop through current user subreddits
                    user.subreddits.forEach((sub) =>{
                        //get and loop through sub's frontpage
                        r.getSubreddit(sub.name).getHot().then((posts) => {
                            posts.forEach((post) =>{
                                //look at 'tags' for current sub, save urls that match with parent sub
                                sub.tags.forEach((tag) =>{
                                    if(post.title.toLowerCase().indexOf(tag.toLowerCase()) >= 0){
                                        bot.results.urls.push(post.url.toString());
                                    }
                                });
                            });
                        });
                    // end subreddit loop
                    });
                //end current user move to next
                });
            //finish all users
            } 
        });     
    },

    log: () =>{
        bot.results.urls.forEach((url) =>{
            console.log(url);
        });
    }

}

module.exports = bot;