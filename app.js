const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const Campground = require("./models/campground.js")
const methodOverride = require("method-override")
const catchAsync = require("./utils/catchAsync.js")
const ExpressError = require("./utils/ExpressError.js")
require("dotenv").config()

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

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
})

app.post("/campgrounds", catchAsync(async (req, res, next) => {
    if(!req.body.campground) throw new ExpressError("Invalid campground data", 400)
    const { campground: newCampround } = req.body
    const campground = await Campground(newCampround)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/show", { campground })
}))

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/edit", { campground })
}))

app.put("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    const { campground: campgroundData } = req.body
    const campground = await Campground.findByIdAndUpdate(id, campgroundData)
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
}))

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