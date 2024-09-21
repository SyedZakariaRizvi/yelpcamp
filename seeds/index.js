const mongoose = require("mongoose")
const Campground = require("../models/campground.js")
const cities = require("./cities.js")
const { descriptors, places } = require("./seedHelpers.js")
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is undefined. Check your .env file and dotenv configuration.");
} else {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
}

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
        const randomPrice = Math.floor(Math.random() * 30) + 10
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            price: randomPrice,
            description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Cupiditate tempora praesentium asperiores odio earum eaque, et aliquam? Voluptatem itaque, laudantium quis vitae eius in assumenda deserunt ipsam animi illum non?",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            author: "66ee1b32c37ffffd96698d75"
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})
