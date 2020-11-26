const express = require("express");
const app = express();
const exphbs = require("express-handlebars");

//Setup view engine - express handlebars
app.engine('.hbs', exphbs({
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

app.use(express.static("assets"));
// app.use(express.static("Doc"));





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

//Register
app.get("/register", (req, res) => {
    res.render("register", {
        layout: false
    })
})

app.post("/register", (req, res) => {
    res.send("s");
})


app.listen(3000, () => {
    console.log("Server is starting at port 3000");
})