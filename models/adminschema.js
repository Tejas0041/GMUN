const mongoose= require('mongoose');
const passportLocalMongoose= require('passport-local-mongoose');

const adminschema= new mongoose.Schema({
    username: String,
});

adminschema.plugin(passportLocalMongoose);

module.exports=mongoose.model('Admin',adminschema);