const express = require("express")
const router = express.Router()

const catchAsync = require("../utils/catchAsync.js")
const ExpressError = require("../utils/ExpressError.js")

const Campground = require("../models/campground.js")
const { campgroundSchema } = require("../schemas.js")

const { isLoggedIn } = require("../middleware.js")

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)

    if(error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

const isAuthor = async (req, res, next) => {
    const { id } = req.params
    const camp = await Campground.findById(id)
    if(!camp.author.equals(req.user._id)) {
        req.flash("error", "You do not have the permission to do that!")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}))

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new")
})

router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const { campground: newCampround } = req.body
    const campground = await Campground(newCampround)
    campground.author = req.user._id
    await campground.save()
    req.flash("success", "Successfully created a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate("reviews").populate("author")
    if(!campground) {
        req.flash("error", "Cannot find this campground!")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground })
}))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if(!campground) {
        req.flash("error", "Cannot find this campground!")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground })
}))

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const { campground: campgroundData } = req.body
    const campground = await Campground.findByIdAndUpdate(id, campgroundData)
    req.flash("success", "Successfully updated campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted campground!")
    res.redirect("/campgrounds")
}))

module.exports = router