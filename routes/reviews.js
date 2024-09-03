const express = require("express")
const router = express.Router({ mergeParams: true })

const Campground = require("../models/campground.js")
const Review = require("../models/review.js")

const { reviewSchema } = require("../schemas.js")

const catchAsync = require("../utils/catchAsync.js")
const ExpressError = require("../utils/ExpressError.js")

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)

    if(error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

router.post("/", validateReview, catchAsync(async (req, res) => {
    const { review: reviewData } = req.body
    const review = new Review(reviewData)
    const { id } = req.params
    const campground = await Campground.findById(id)
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    res.redirect(`/campgrounds/${id}`)
}))

router.delete("/:reviewID", catchAsync(async (req, res) => {
    const { id: campgroundID, reviewID } = req.params
    await Campground.findByIdAndUpdate(campgroundID, { $pull: { reviews: reviewID } })
    await Review.findByIdAndDelete(reviewID)
    res.redirect(`/campgrounds/${campgroundID}`)
}))

module.exports = router