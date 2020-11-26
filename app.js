const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require('express-session');
var bcrypt = require('bcryptjs');


const app = express();
const Schema = mongoose.Schema;

//User Schema
const UserSchema = new Schema({
    username: String,
    password: String
})

//User Model
const User = mongoose.model("User", UserSchema);


//Setup view engine - express handlebars
app.engine('.hbs', exphbs({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

app.use(express.static("assets"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

//SESSION SETUP
app.use(session({
    secret: 'elearning-platform',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password"
},
    function (username, password, cb) {
        User.findOne({ username: username })
            .then(async (user) => {
                if (!user) {
                    return cb(null, false)
                }

                //user exists, check for password 
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return cb(null, false);
                }

                //now user has been verified
                return cb(null, user);                
            })
            .catch((err) => {
                cb(err);
            });
    }));


passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    User.findById(id, function (err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    })
})



//Mongoose
mongoose.connect('mongodb://localhost:27017/elearning', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});




//Routes
app.get("/", (req, res) => {
    res.render("index")
})

//Login
app.get("/login", (req, res) => {
    res.render("login", {
        layout: false
    });
})
app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/"
}))

//Register
app.get("/register", (req, res) => {
    res.render("register", {
        layout: false
    })
})

app.post("/register", async (req, res) => {
    const data = req.body;
    //Validate user input
    if (data.password1 === data.password2) {
        //Save user's password as hashed version
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(data.password1, salt);

        //Create user
        const user = {
            username: data.email,
            password: hashedPassword
        }
        await User.create(user);
        res.redirect("/login");
    } else {
        res.send("Failed");
    }


})


app.listen(3000, () => {
    console.log("Server is starting at port 3000");
})