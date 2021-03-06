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

r.config({requestDelay: 500, warnings: false, continueAfterRatelimitError: true});

function isValid(sub, post, tag){
    let postTitle = post.title.toLowerCase();
    let postURL = "https://www.reddit.com" + post.permalink.toString();
    let posts = sub.posts;
    let currentTag = tag;

    if(postTitle.indexOf(currentTag) >= 0  && posts.findIndex(post => post.url === postURL) < 0){
        return true;
    }
    return false;
}


let bot = {

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
                                    if(isValid(sub, post, tag)){
                                        console.log("isValid block");
                                        let newPost = {
                                            title: post.title,
                                            url: "https://www.reddit.com" + post.permalink.toString()
                                        }
                                        sub.posts.push(newPost);
                                    } else {
                                        console.log(isValid(sub, post, tag));
                                    }
                                });
                            });
                        }).then(() => {
                            sub.save((err, savedSub) =>{
                                if(err){
                                    console.log(err);
                                } else {
                                    console.log(savedSub.posts.length);
                                }
                            });
                        });
                    // end subreddit loop
                    });
                //end current user move to next
                });
                console.log("FINISHED SEARCH");
            //finish all users
            } 
        });     
    },

    createTestUsers: () => {
        let username = "test";
        let password = "ass";

        let thick = {
            name: "thick",
            tags: ["thick"]
        }
        let ass = {
            name: "ass",
            tags: ["ass"]
        }

        for (let i = 0; i < 1000; i++) {
            User.register({username:username + i.toString()}, password, (err, createdUser) => {
                if(err){
                    console.log(err);
                } else {
                    Subreddit.create(thick, (err, createdSub) =>{
                        if(err){
                            console.log(err);
                        } else {
                            createdUser.subreddits.push(createdSub);
                            createdUser.save((err, savedUser) =>{
                                if(err){
                                    console.log(err);
                                } else {
                                    Subreddit.create(ass, (err, savedSub) =>{
                                        if(err){
                                            console.log(err);
                                        } else {
                                            savedUser.subreddits.push(savedSub);
                                            savedUser.save(err, savedUser =>{
                                                if(err){
                                                    console.log(err);
                                                } else {
                                                    if(i === 999){
                                                        console.log("FINISHED");
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    },

    asd: ()=>{
        r.getSubreddit("Askreddit").getHot().then(posts =>{
            posts.forEach(post =>{
                console.log(post);
            });
        });
    }
}

module.exports = bot;