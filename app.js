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

app.get("/makecampground", async (req, res) => {
    const camp = new Campground({ title: "Camp One", description: "First campground" })
    await camp.save()
    res.send(camp)
})

app.listen(PORT, () => {
    console.log(`Server started at PORT ${PORT}`)
})