const mongoose = require('mongoose');
//MongoDB schema
const locationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    xyz : [{ type : Number, required: true }],
    viewM : [{type : Number, required: true}],
});
//How to define : key : type of value

module.exports = mongoose.model('LocationSocket',locationSchema);
//first parm : name for internal use


//db schema
//get 1) location name(if null, make arbirary name with user id), 
//    2) latitude, longtitude, altitude(set default value)
//    3) text(required)
//    4) address field is automatically inserted
// 지도 api로 주소를 찍어서 고도만 설정(추천값 주고 - 눈높이, 머리 위 등)
