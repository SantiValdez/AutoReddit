const express       = require("express"),
      router        = express.Router(),
      passport      = require("passport"),
      User          = require("../models/User"),
      Subreddit     = require("../models/Subreddit");

router.get("/", (req, res) =>{
    res.render("landing.ejs");
});

router.get("/signup", (req, res) =>{
    res.render("signup.ejs");
});

router.post("/signup", (req, res) =>{
    let username = req.body.username;
    let password = req.body.password;
    let subreddit = req.body.subreddit;

    console.log(req.body);

    let newUser = new User({username: username});
    User.register(newUser, req.body.password, (err, createdUser) => {
        if(err){
            console.log(err);
            return res.render("/signup");
        }

        let newSubreddit = {name: subreddit};
        Subreddit.create(newSubreddit, (err, createdSubreddit) =>{
            if(err){
                console.log(err);
            } else {
                User.findOne({username: username}, (err, foundUser) =>{
                    if(err){
                        console.log(err);
                    } else {
                        console.log(foundUser);
                        foundUser.subreddits.push(createdSubreddit._id);
                        foundUser.save((err, savedUser)=>{
                            if(err){
                                console.log(err);
                            } else {
                                console.log(savedUser);
                                console.log("pushed subreddit to new user & saved user");
                            }
                        });
                    }
                });
            }
        });

        passport.authenticate("local")(req, res, ()=>{
            console.log("auth done!!!!");
            res.redirect("/");
        });
    });
    User.find({}, (err, foundUsers) =>{
        console.log(foundUsers);
    });
});

router.get("/login", (req, res) =>{
    res.render("login.ejs");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/userControlPanel",
    failureRedirect: "/signup"
}), (req, res) =>{
});

router.get("/logout", (req,res) =>{
    req.logout();
    res.redirect("/login");
});

module.exports = router;