const LocSocketDB = require('../models/locationSocketDB');
const mongoose = require('mongoose');

function GetAll(io, socket, id){
    LocSocketDB.find({ _id : { $ne : id}}) //find all
                .select('name xyz viewM _id')//define which fields we want to pass
            //.populate() : 특정 key와 연결된 db가 있을경우(relation으로 존재하는 key), 가져와 넣는
                .exec()
                .then(locations => {
                    console.log(id,"is getting ",locations[0].name);
                    if(locations.length >=1){
                        var response = {
                         code : 200,
                         location_data : locations.map(location => { //배열이므로 map
                            //adding response metadata for "self-descriptive"
                                return {
                                    name : location.name,
                                    xyz : location.xyz,
                                    viewM : location.viewM,
                                    _id : location._id,
                                    request : { //연결해주고 싶은 거에 따라 정해준다.
                                        type : 'GET',
                                        url : process.env.URL_OF_REST + '/locations/' + location._id
                                    }
                                    //url에 각 오브젝트의 URL 을 넘겨주어 구체적인 정보 확인도 가능하게 함
                                }
                            }) // map into new array
                        };
                    
                        // io.emit("Server_Update",response); //sender client도 포함한 모든 클라이언트
                        socket.emit("Server_Update",response); //sender client를 제외한 모든 클라이언트
                        // date = new Date();
                        // console.log(socket.id," is getting at ",date);
                        //if there is no objects, it will return empty array not null!
                    } else {
                        console.log("Empty db",locations);
                        var message = {
                            code : 401,
                            message : 'Empty db'
                        };
                        socket.emit("Error",message);
                    }
                
                })
                .catch(err=>{
                    console.log("Error Getall :",err);
                    var message = {
                        code : 500,
                        message : "Error among GETALL query"
                    }
                    socket.emit("Error",message);
                })
}

//현재 userDB에 회원가입시 자동으로 등록을 함에 따라 register()는 이용되고 있지 않다.
exports.register = (io, socket) => {
    return function(data){
        // console.log("Received from Client Data :",data," type = xyz : ",(data.xyz), " , viewM : ",(data.viewM));
        const person = new LocSocketDB({
            _id: data._id,
            name: data.name,
            xyz : JSON.parse(data.xyz),
            viewM : JSON.parse(data.viewM),
        });
        person.save()//save will store in db
            .then(result => {
                console.log("saved result : ",result);
                var response = {
                    code : 200,
                    message: 'location data registered properly',
                    created_location : {
                        name : result.name,
                        xyz : result.xyz,
                        viewM : result.viewM,
                        _id : result._id,
                        request : {
                           type : 'GET', //Not 'Post' cause this is for next transition helper 
                           url : process.env.URL_OF_REST + "/locations/" + result._id 
                        }
                    }
                };
                socket.emit("Server_Register",response);
            }) 
            .catch(err=> {
                console.log("Error Register:",err);
                var response = {
                    code : 500,
                    message : "Error among server register"
                }
                socket.emit("Error",response);
            });
    };
}

exports.update = (io, socket) => {
    return function(data) {
        // console.log("Cnt : ",data.cnt);
        const id = data._id;
        // if(data.xyz != undefined && data.viewM != undefined){
        try{
            const updateOps = {
                xyz : JSON.parse(data.xyz),
                viewM : JSON.parse(data.viewM),
            };
            LocSocketDB.updateOne({ _id : id}, { $set : updateOps})
                .exec()
                .then(result=>{
                    // console.log("Updated result : ",result);
                    //개인의 Update가 완료되면 다른 모든 사람들의 location 정보를 fetch해와 emit한다.
                    socket.emit("Server_Update",result);
                    // GetAll(io, socket, id)
                })
                .catch(err => {
                    console.log("Error Update :",err);
                    var response = {
                        code : 500,
                        message : err
                    }
                    socket.emit("ERROR",response);
                })
            // }
        } catch (e){
            console.log("Error among parsing json data in 'update'",e);
        }
        
    };
}

exports.getAll = (socket) => {

    return function(data){
        LocSocketDB.find({ _id : { $ne : data._id}}) //find all
        .select('name xyz viewM _id')//define which fields we want to pass
    //.populate() : 특정 key와 연결된 db가 있을경우(relation으로 존재하는 key), 가져와 넣는
        .exec()
        .then(locations => {
            console.log(id,"is getting ",locations[0].name);
            if(locations.length >=1){
                var response = {
                 code : 200,
                 location_data : locations.map(location => { //배열이므로 map
                    //adding response metadata for "self-descriptive"
                        return {
                            name : location.name,
                            xyz : location.xyz,
                            viewM : location.viewM,
                            _id : location._id,
                            request : { //연결해주고 싶은 거에 따라 정해준다.
                                type : 'GET',
                                url : process.env.URL_OF_REST + '/locations/' + location._id
                            }
                            //url에 각 오브젝트의 URL 을 넘겨주어 구체적인 정보 확인도 가능하게 함
                        }
                    }) // map into new array
                };
            
                // io.emit("Server_Update",response); //sender client도 포함한 모든 클라이언트
                socket.emit("Server_GetAll",response); //sender client를 제외한 모든 클라이언트
                // date = new Date();
                // console.log(socket.id," is getting at ",date);
                //if there is no objects, it will return empty array not null!
            } else {
                console.log("Empty db",locations);
                var message = {
                    code : 401,
                    message : 'Empty db'
                };
                socket.emit("Error",message);
            }
        
        })
        .catch(err=>{
            console.log("Error Getall :",err);
            var message = {
                code : 500,
                message : "Error among GETALL query"
            }
            socket.emit("Error",message);
        })
    }
    
}


exports.delete = (io, socket) => {
    return function(data) {
        const id = req.params.locationID;
        LocationDB.remove({_id: id})//remove every objects in satisfying this criteria
            .exec()
            .then(result=>{
                console.log("Delete successful", result);
                var response = {
                    message : 'Delete successful',
                    delete_result : result,
                    request : {
                        type : 'GET',
                        url : process.env.URL_OF_REST + '/locations'
                    }
                };
                socket.emit("Socket_DELETE",response);
            })
            .catch(err=>{
                console.log(err);
                var response = {
                    code : 500,
                    message : err
                }
                socket.emit("ERROR",response);
            }) 
    };
}

