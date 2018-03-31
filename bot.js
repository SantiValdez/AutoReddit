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

function isValid(user, post, tag){
    let postTitle = post.title.toLowerCase();
    let postURL = "https://www.reddit.com" + post.permalink.toString();
    let posts = user.posts;
    let currentTag = tag;

    if(postTitle.indexOf(currentTag) >= 0  && posts.findIndex(post => post.url === postURL) < 0){
        return false;
    }
    return true;
}

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
                                //look at 'tags' for current sub, save urls (permalink, url is the direct submission url) that match with parent sub
                                sub.tags.forEach((tag) =>{
                                    if(!isValid(user, post, tag)){
                                        bot.results.urls.push(post.permalink.toString());
                                        let newPost = {
                                            title: post.title,
                                            url: "https://www.reddit.com" + post.permalink.toString()
                                        };
                                        user.posts.push(newPost);
                                        user.save((err, savedUser) =>{
                                            if(err){
                                                console.log(err);
                                            } else {
                                                console.log("Saved post to user posts array \n " + savedUser);
                                            }
                                        });
                                    } else {
                                        console.log(isValid(user, post, tag));
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