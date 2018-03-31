const express         = require("express"),
      app             = express(),
      bodyParser      = require("body-parser"),
      mongoose        = require("mongoose"),
      User            = require("./models/User"),
      Subreddit       = require("./models/Subreddit"),
      Post            = require("./models/Post"),
      passport        = require("passport"),
      LocalStrategy   = require("passport-local"),
      methodOverride  = require("method-override"),
      userRoutes      = require("./routes/users"),
      indexRoutes     = require("./routes/index"),
      Bot             = require("./bot");


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
    res.locals.currentUser = req.user;
    next();
});

app.use(indexRoutes);
app.use("/userControlPanel", userRoutes);


setInterval(()=>{
    Bot.search();
}, 10000);



const server = app.listen(27017, ()=> {
    console.log("----------SERVER UP----------");
});