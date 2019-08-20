const UserDB = require('../models/userDB');
const mongoose = require('mongoose');

/** UserDB 내 'xyz', 'viewM' 값 수정 */
exports.update = (io, socket) => {

    return function(data) {
        //User가 보낸 data에 'nickname' ,'xyz', 'viewM' field 존재 여부
        if(data._id != undefined && data.xyz != undefined && data.viewM != undefined){
            const id = data._id;

            try{
                /** 항상 모든 field를 바꾸지 않을 수도 있으므로
                * 수정할 data => updateOps 변수에서 재정의하여 처리
                * User가 보낼 request 형식 : [{
                *  "propName" : 수정할 field명,
                *  "value" : 수정할 값
                * }, {}, {}, ...]
                * ex. [{"propName":"name", "value":"변경할 key의 값"}]
                */
                const updateOps = {
                xyz : JSON.parse(data.xyz),
                viewM : JSON.parse(data.viewM),
                };

                UserDB.updateOne({ _id : id}, { $set : updateOps})
                    .exec()
                    .then(result=>{
                        socket.emit("Server_Update",result);
                    })
                    .catch(err => {
                        console.log("Error Update :",err);
                        var response = {
                            code : 500,
                            message : err
                        }
                        socket.emit("ERROR",response);
                    })
                
            } catch (error){
                var response = {
                    code : 500,
                    message : "Error among updating location data"
                }
                socket.emit("ERROR",response);
                console.log("Error among parsing json data in 'update'",error);
            }

        } else {
            var response = {
                code : 404,
                message : "_id or xyz or viewM undefined"
            }
            socket.emit("ERROR",response);
        }
    };
}


/** UserDB 내 모든 데이터 가져옴 */
exports.getAll = (socket) => {

    return function(data){

        // User가 보낸 id 값을 '제외'한 query
        UserDB.find({ _id : { $ne : data._id}}) 
        .select('nickname xyz viewM')
        .exec()
        .then(locations => {

            if(locations.length >=1){
                var response = {
                 code : 200,
                 location_data : locations.map(location => { //map() = 기존 배열을 원하는 새로운 배열로 refine
                        //여기서 return은 map() 메소드의 return
                        return {
                            nickname : location.nickname,
                            xyz : location.xyz,
                            viewM : location.viewM,
                            request : { 
                                type : 'GET',
                                url : process.env.URL_OF_REST + '/locations/' + location._id
                            }
                        }
                    })
                };
            
                // io.emit("Server_Update",response); //sender client도 포함한 모든 클라이언트
                socket.emit("Server_GetAll",response); //sender client를 제외한 모든 클라이언트
                
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
    };
    
}


/** UserDB 내 특정 데이터 삭제 */
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

