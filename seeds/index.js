const mongoose = require("mongoose")
const Campground = require("../models/campground.js")
const cities = require("./cities.js")
const { descriptors, places } = require("./seedHelpers.js")
require("dotenv").config()

console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Database Connected")
    })
    .catch((err) => {
        console.log("Error Connecting to Database", err)
    })

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)]
}

const seedDB = async () => {
    await Campground.deleteMany({})
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city, cities[random1000].state}`
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})
