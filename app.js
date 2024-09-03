const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const session = require("express-session")
const flash = require("connect-flash")
require("dotenv").config()

const ExpressError = require("./utils/ExpressError.js")

const campgrounds = require("./routes/campgrounds.js")
const reviews = require("./routes/reviews.js")

mongoose.connect(process.env.MONGODB_URI)
    .then(() => { 
        console.log("Database Connected")
    })
    .catch((err) => {
        console.log("Error connecting to Database: ", err)
    })

const app = express()
const PORT = 3000

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: Date.now() + 1000 * 60 * 60 * 24
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

app.use("/campgrounds", campgrounds)
app.use("/campgrounds/:id/reviews", reviews)

app.get("/", (req, res) => {
    res.render("home")
})

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if(!err.message) err.message = "Something went wrong"
    res.status(statusCode).render("error", { err })
})

app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`)
})