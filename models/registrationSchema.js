const mongoose= require('mongoose')

const ImageSchema= new mongoose.Schema({
    url: String,
    filename: String,
});

const regSchema= new mongoose.Schema({
    name: String,
    phone: Number,
    whatsapp: Number,
    email: String,
    mun_attended: String,
    college: String,
    committee: String,
    preference: Array,
    date: String,
    image: [ImageSchema]
})

module.exports= mongoose.model('Registration', regSchema)