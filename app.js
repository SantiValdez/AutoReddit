const express         = require("express"),
      app             = express(),
      bodyParser      = require("body-parser"),
      mongoose        = require("mongoose"),
      User            = require("./models/User"),
      Subreddit       = require("./models/Subreddit"),
      Post            = require("./models/Post"),
      passport        = require("passport"),
      LocalStrategy   = require("passport-local"),
      methodOverride  = require("method-override");


mongoose.connect("mongodb://127.0.0.1:27017/auto_reddit").then( ()=> {
    console.log("successfully connected to MONGO");
}, (err) =>{
    console.log(err);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//css boilerplate
app.use(express.static(__dirname + '/public'));
//auth stuff
app.use(require("express-session")({
    secret: "cats > dogs",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride("_method"));
app.use(function (req, res, next) {
    res.locals.login = req.isAuthenticated();
    next();
});


app.get("/", (req, res) =>{
    res.render("landing.ejs");
});

app.get("/signup", (req, res) =>{
    res.render("signup.ejs");
});

app.post("/signup", (req, res) =>{
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

app.get("/login", (req, res) =>{
    res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/signup"
}), (req, res) =>{
});

app.get("/logout", (req,res) =>{
    req.logout();
    res.redirect("/login");
});

app.get("/userControlPanel", isLoggedIn, (req, res) =>{
    User.findOne({username:req.user.username}).populate("subreddits").exec((err, foundUser)=>{
        if(err){
            console.log(err);
        } else {
            res.render("userControlPanel.ejs", {user: foundUser});     
        }
    });
});

app.post("/userControlPanel", isLoggedIn, (req, res)=>{
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

app.post("/userControlPanel/:subreddit", isLoggedIn, (req, res) =>{
    let subredditName = req.body.subredditName;

    res.render("subreddit.ejs", {subredditName: subredditName});
});

app.delete("/:subreddit", isLoggedIn, (req,res) =>{
    let subredditName = req.body.subredditName;
    Subreddit.findOneAndRemove({name: subredditName}, (err) =>{
        if(err){
            console.log(err);
        } else {
            res.redirect("/userControlPanel");
        }
    });
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

const server = app.listen(27017, ()=> {
    console.log("----------SERVER UP----------");
});