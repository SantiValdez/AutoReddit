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

let saved = false; //prevents weird issue of mongoose calling the save function after everything else causing multiple saves, idk...

let bot = {

    search: () =>{
        //loop through all users
        User.find({}).populate("subreddits").exec((err, foundUsers) =>{
            if(err){
                console.log(err);
            } else {
                //current user
                foundUsers.forEach((user) =>{
                    saved = false;
                    // loop through current user subreddits
                    user.subreddits.forEach((sub) =>{
                        saved = false;
                        //get and loop through sub's frontpage
                        r.getSubreddit(sub.name).getHot().then((posts) => {
                            posts.forEach((post) =>{
                                //look at 'tags' for current sub, save urls (permalink, url is the direct submission url) that match with parent sub
                                sub.tags.forEach((tag) =>{
                                    if(isValid(sub, post, tag)){
                                        console.log("problem here????");
                                        let newPost = {
                                            title: post.title,
                                            url: "https://www.reddit.com" + post.permalink.toString()
                                        }
                                        sub.posts.push(newPost);
                                        if(!saved){
                                            sub.save((err, savedSub) =>{
                                                if(err){
                                                    console.log(err);
                                                } else {
                                                    console.log(savedSub.posts.length);
                                                }
                                            });
                                            saved = true;
                                        }
                                    } else {
                                        console.log(isValid(sub, post, tag));
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

    createTestUsers: () => {
        let username = "HarryHayes";
        let password = "ass";

        let thick = {
            name: "thick",
            tags: ["sabrina"]
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