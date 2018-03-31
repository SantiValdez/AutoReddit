const express       = require("express"),
      router        = express.Router(),
      passport      = require("passport"),
      User          = require("../models/User"),
      Subreddit     = require("../models/Subreddit"),
      middleware    = require("../middleware");

router.get("/", middleware.isLoggedIn, (req, res) =>{
    User.findOne({username:req.user.username}).populate("subreddits").exec((err, foundUser)=>{
        if(err){
            console.log(err);
        } else {
            res.render("userControlPanel.ejs", {user: foundUser});     
        }
    });
});

router.post("/", middleware.isLoggedIn, (req, res)=>{
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

router.get("/:subreddit", middleware.isLoggedIn, (req, res) =>{
    let subredditID = req.params.subreddit;

    Subreddit.findById(subredditID, (err, foundSub)=>{
        if(err){
            console.log(err);
        } else {
            res.render("subreddit.ejs", {subreddit:foundSub});
        }
    });
});

router.delete("/:subreddit", middleware.isLoggedIn, (req,res) =>{
    let subToRemove = req.body.subreddit;

    Subreddit.findByIdAndRemove(subToRemove, (err)=>{
        if(err){
            console.log(err);
        } else {
            res.redirect("/userControlPanel");
        }
    })
});

router.get("/:subreddit/tags", middleware.isLoggedIn, (req, res) =>{
    let subredditID = req.params.subreddit;

    Subreddit.findById(subredditID, (err, foundSub) =>{
        if(err){
            console.log(err);
        } else {
            res.render("tags.ejs", {subreddit:foundSub});
        }
    });

});

router.post("/:subreddit/tags", middleware.isLoggedIn, (req, res) =>{
    let newTag = req.body.tagName;
    let id = req.user._id;
    
    User.findById(id).populate("subreddits").exec((err, foundUser)=>{
        if(err){
            console.log(err);
        } else {
            foundUser.subreddits.forEach((sub)=>{
                if(sub._id.toString() === req.params.subreddit){
                    sub.tags.push(newTag);
                    sub.save((err, savedSub) =>{
                        if(err){
                            console.log(err);
                        } else {
                            res.redirect("back");
                        }
                    });
                }
            });
        }
    });
});

router.put("/:subreddit/tags", middleware.isLoggedIn, (req, res) =>{
    let subredditID = req.params.subreddit;
    let tagToDelete = req.body.tag;

    Subreddit.findById(subredditID, (err, foundSub)=>{
        if(err){
            console.log(err);
        } else {
            foundSub.tags.pull(tagToDelete);
            foundSub.save((err, savedSub) =>{
                if(err){
                    console.log(err);
                } else {
                    res.redirect("back");
                }
            });
        }
    });
});

module.exports = router;