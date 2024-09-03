const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const Campground = require("./models/campground.js")
const Review = require("./models/review.js")
const methodOverride = require("method-override")
const catchAsync = require("./utils/catchAsync.js")
const ExpressError = require("./utils/ExpressError.js")
const { reviewSchema } = require("./schemas.js")
const campgrounds = require("./routes/campgrounds.js")
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

app.use("/campgrounds", campgrounds)

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)

    if(error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

app.get("/", (req, res) => {
    res.render("home")
})

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    const { review: reviewData } = req.body
    const review = new Review(reviewData)
    const { id } = req.params
    const campground = await Campground.findById(id)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    res.redirect(`/campgrounds/${id}`)
}))

app.delete("/campgrounds/:campgroundID/reviews/:reviewID", catchAsync(async (req, res) => {
    const { campgroundID, reviewID } = req.params
    await Campground.findByIdAndUpdate(campgroundID, { $pull: { reviews: reviewID } })
    await Review.findByIdAndDelete(reviewID)
    res.redirect(`/campgrounds/${campgroundID}`)
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