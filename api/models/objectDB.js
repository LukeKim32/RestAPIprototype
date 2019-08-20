const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    nickname : {type : String, required : true},
    xyz : [{ type : Number, required: true }]
});

module.exports = mongoose.model('Object',userSchema);