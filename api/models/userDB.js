const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email : { 
        type : String, 
        required : true, 
        unique: true, 
        //unique doesnt validate the email, it only optimizes the db performance
        match : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },//match : checks if email address is valid format
    password : {type : String, required : true},
    nickname : {type : String, required : true},
    xyz : [{ type : Number, required: true }],
    viewM : [{type : Number, required: true}]
});

module.exports = mongoose.model('User',userSchema);