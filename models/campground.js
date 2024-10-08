const mongoose = require("mongoose")
const Review = require("./review.js")
const Schema = mongoose.Schema

const campgroundSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
})

campgroundSchema.post("findOneAndDelete", async (campground) => {
    if(campground) {
        await Review.deleteMany({ _id: { $in: campground.reviews }})
    }
})

module.exports = mongoose.model("Campground", campgroundSchema)