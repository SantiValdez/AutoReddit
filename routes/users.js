const express       = require("express"),
      router        = express.Router(),
      passport      = require("passport"),
      User          = require("../models/User"),
      Subreddit     = require("../models/Subreddit"),
      middleware    = require("../middleware");

router.get("/userControlPanel", middleware.isLoggedIn, (req, res) =>{
    User.findOne({username:req.user.username}).populate("subreddits").exec((err, foundUser)=>{
        if(err){
            console.log(err);
        } else {
            res.render("userControlPanel.ejs", {user: foundUser});     
        }
    });
});

router.post("/userControlPanel", middleware.isLoggedIn, (req, res)=>{
    let newSubName = req.body.newSubreddit;
    let newSub = {name: newSubName};

    Subreddit.create(newSub, (err, createdSubreddit)=>{
        if(err){
            console.log(err);
        } else {
            User.findOne({username:req.user.username}, (err, foundUser)=>{
                if(err){
                    console.log(err);
                } else {
                    foundUser.subreddits.push(createdSubreddit);
                    foundUser.save((err, savedUser) =>{
                        if(err){
                            console.log(err);
                        } else {
                            res.redirect("/userControlPanel");
                        }
                    });
                }
            });
        }
    });
});

router.post("/userControlPanel/:subreddit", middleware.isLoggedIn, (req, res) =>{
    let subredditName = req.body.subredditName;

    res.render("subreddit.ejs", {subredditName: subredditName});
});

router.delete("/:subreddit", middleware.isLoggedIn, (req,res) =>{
    let subredditName = req.body.subredditName;
    Subreddit.findOneAndRemove({name: subredditName}, (err) =>{
        if(err){
            console.log(err);
        } else {
            res.redirect("/userControlPanel");
        }
    });
});

module.exports = router;