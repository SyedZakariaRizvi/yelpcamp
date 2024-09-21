const express = require("express")
const router = express.Router({ mergeParams: true })

const Campground = require("../models/campground.js")
const Review = require("../models/review.js")

const catchAsync = require("../utils/catchAsync.js")

const { validateReview, isLoggedIn } = require("../middleware.js")

router.post("/", isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const { review: reviewData } = req.body
    const review = new Review(reviewData)
    review.author = req.user._id
    const { id } = req.params
    const campground = await Campground.findById(id)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash("success", "Created new review!")
    res.redirect(`/campgrounds/${id}`)
}))

router.delete("/:reviewID", catchAsync(async (req, res) => {
    const { id: campgroundID, reviewID } = req.params
    await Campground.findByIdAndUpdate(campgroundID, { $pull: { reviews: reviewID } })
    await Review.findByIdAndDelete(reviewID)
    req.flash("success", "Successfully deleted review!")
    res.redirect(`/campgrounds/${campgroundID}`)
}))

module.exports = router