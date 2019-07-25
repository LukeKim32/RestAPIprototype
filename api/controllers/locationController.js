const LocationDB = require('../models/locationDB');
const mongoose = require('mongoose');

exports.location_get_all = (req, res, next) => {
    console.log("location_get_all in");
    //Product.find().where -> more conditions
    //Product.find().limit,
    LocationDB.find() //find all
        .select('name text address latitude longitude altitude _id')//define which fields we want to pass
        //.populate() : 특정 key와 연결된 db가 있을경우(relation으로 존재하는 key), 가져와 넣는
        .exec()
        .then(locations => {
            if(locations.length >=1){
                const response = {
                    location_data : locations.map(location => { //배열이므로 map
                        //adding response metadata for "self-descriptive"
                        return {
                            name : location.name,
                            latitude : location.latitude,
                            longitude : location.longitude,
                            altitude : location.altitude,
                            text : location.text,
                            address : location.address,
                            _id : location._id,
                            request : { //연결해주고 싶은 거에 따라 정해준다.
                                type : 'GET',
                                url : process.env.URL_OF_REST + '/locations/' + location._id
                            }
                            //url에 각 오브젝트의 URL 을 넘겨주어 구체적인 정보 확인도 가능하게 함
                        }
                    }) // map into new array
                }
                console.log(response);
                res.status(200).json(response);
                //if there is no objects, it will return empty array not null!
            } else {
                console.log("Empty db",locations);
                res.status(401).json({
                    message : "No data in db",
                    request : {
                        type : 'POST',
                        url : process.env.URL_OF_REST + '/locations'
                    }
                });
            }
            
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error: err});
        })
}

exports.location_register = (req, res, next) => {
    //post needs validation because user can send not appropriate data type or error
    // ex. price is Number type but what if user sends String type?
    // mongoose checks automatically but doesnt check the absence of all key existence
    //this can be checked by editing db schema - require : true
    //그니깐 쿼리의 예외의 경우를 받아야 한다. 만약 다른 조건을 다 만족하는데 추가적인 존재하지 않는 데이터가 넘어와도
    //처리를 하고 있으므로 받지 않을 수 있다.
    const location = new LocationDB({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        latitude : req.body.latitude,
        longitude : req.body.longitude,
        altitude : req.body.altitude,
        text : req.body.text,
        address : req.body.address,
    });
    location.save()//save will store in db
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'location registered properly',
                created_location : {
                    name : result.name,
                    text : result.text,
                    address : result.address,
                    _id : result._id,
                    request : {
                       type : 'GET', //Not 'Post' cause this is for next transition helper 
                       url : process.env.URL_OF_REST + "/locations/" + result._id 
                    }
                }
            });
        }) 
        .catch(err=> {
            console.log(err);
            res.status(500).json({
                error : err
            })
        });
    //어떻게 name member가 오는지 알 수 아는가? 문서에 어떤 data가 오면 어떤 data가 갈지 적어놔야한다
    
}

exports.location_get_one_info = (req, res, next) => {
    //const id = new ObjectID(req.params.locationID);
    const id = req.params.locationID;
    LocationDB.findById(id)
        .select('name location_name latitude longitude altitude text address _id')
        .exec()
        .then( location => {
            console.log("Found from db",location);
            if(location) { //if location is not null, mongoDB는 id 값이 없는데 찾아도 리턴이 된다.
                res.status(200).json({
                    location_data : location,
                    request: {
                        type : 'GET',
                        url : process.env.URL_OF_REST + '/locations'
                        //Show all locations after showing one
                    }
                });
            } else { // if there is no location data found in db
                res.status(404).json({
                    error : "No data fetched"
                });
                //id 값 포맷은 같은데 값이 다른 거인듯
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error : err});
            //아예 id 값 포맷이 오류인듯
        });
    //res.status(200).json({doc}); 이 줄에 짜면 비동기로 돌아가서 먼저 res 될수도 있다 then() 실행 전
}

exports.location_edit_info = (req, res, next) => {
    //update data
    const id = req.params.locationID;
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value
    } //항상 모든 키를 바꾸지 않을 수도 있으므로
    //받아오는 data 를 정의해야 올바르게 여기서 처리할 수 있다.
    //그냥 json object를 요청받으면 처리 불가능
    // [ { 키 : 값} , { 키 : 값}] 이런식으로 오브젝트를 갖는 배열로 받아오고 싶은 것
    // ex. [{"propName":"name", "value":"변경할 key의 값"}]
    // propName은 key 값이므로 key 값 자체를 value로 갖는 json을 보내 특정 key를 지칭하고자 한것
    console.log(id);
    //first parameter is for get an object
    //second parameter is for mongoose 
    LocationDB.update({ _id : id}, { $set : updateOps})
        .exec()
        .then(result=>{
            console.log(result);
            res.status(200).json({
                message : 'Location data updated properly',
                update_results : result,
                request : {
                    type : 'GET',
                    url : process.env.URL_OF_REST + '/locations/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            })
        })
    
}

exports.location_delete_one = (req, res, next) => {
    const id = req.params.locationID;
    LocationDB.remove({_id: id})//remove every objects in satisfying this criteria
        .exec()
        .then(result=>{
            console.log("Delete successful", result);
            res.status(200).json({
                message : 'Delete successful',
                delete_result : result,
                request : {
                    type : 'GET',
                    url : process.env.URL_OF_REST + '/locations'
                }
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error : err
            })
        }) 
}
