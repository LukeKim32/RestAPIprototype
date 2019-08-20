const ObjectDB = require('../models/objectDB');
const mongoose = require('mongoose');

/** Obeject DB에 렌더링할 Andy의 좌표 추가 */
exports.addAndy = (io, socket) => {

    return function(data) {
        //User가 보낸 data에 'nickname' ,'xyz' field 존재 여부
        if(data.nickname != undefined && data.xyz != undefined){
            try{
                const andyData = new ObjectDB({
                    _id : new mongoose.Types.ObjectId(),
                    nickname : data.nickname,
                    xyz : JSON.parse(data.xyz),
                });

                andyData.save()
                    .then(result=>{

                        ObjectDB.find()
                        .select('nickname xyz _id')
                        .then(objects => {
                            var response = {
                                code : 200,
                                objects : objects.map(object => { //map() = 기존 배열을 원하는 새로운 배열로 refine
                                    //여기서 return은 map() 메소드의 return
                                       return {
                                           _id : object._id,
                                           nickname : object.nickname,
                                           xyz : object.xyz,
                                       }
                                   })
                               };

                            //io.emit = 소켓 연결된 모든 유저들에게 전달
                            io.emit("Server_Add_Andy", response);   
                        })
                        .catch(err => {
                            console.log("Error among find all objects : ",err);
                            var response = {
                                code : 500,
                                message : err
                            }

                            //socket.emit = 소켓 통신한 유저에게만 응답
                            socket.emit("ERROR", response);
                        })
                    })
                    .catch(err => {
                        console.log("Error adding Andy :", err);
                        var response = {
                            code : 500,
                            message : err
                        }
                        socket.emit("ERROR", response);
                    })

            } catch (error){
                var response = {
                    code : 500,
                    message : "Error among adding Andy"
                }
                socket.emit("ERROR", response);
                console.log("Error adding Andy in 'addAndy'",error);
            }

        } else {
            var response = {
                code : 404,
                message : "nickname or xyz undefined"
            }
            socket.emit("ERROR",response);
        }
    };
}
