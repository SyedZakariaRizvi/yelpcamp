const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Campground = require("./models/campground.js")
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

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
})

app.get("/campgrounds/:id", async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/show", { campground })
})

app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`)
})