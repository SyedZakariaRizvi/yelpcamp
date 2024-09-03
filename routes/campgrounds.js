const express = require("express")
const router = express.Router()
const Campground = require("../models/campground.js")
const catchAsync = require("../utils/catchAsync.js")
const { campgroundSchema } = require("../schemas.js")
const ExpressError = require("../utils/ExpressError.js")

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)

    if(error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))

router.get("/new", (req, res) => {
    res.render("campgrounds/new")
})

router.post("/", validateCampground, catchAsync(async (req, res, next) => {
    const { campground: newCampround } = req.body
    const campground = await Campground(newCampround)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate("reviews")
    res.render("campgrounds/show", { campground })
}))

router.get("/:id/edit", catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/edit", { campground })
}))

router.put("/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const { campground: campgroundData } = req.body
    const campground = await Campground.findByIdAndUpdate(id, campgroundData)
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete("/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
}))

module.exports = router