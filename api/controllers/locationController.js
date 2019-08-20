const LocationDB = require('../models/locationDB');
const mongoose = require('mongoose');

/** Location DB내 모든 data 가져옴 */
exports.location_get_all = (req, res, next) => {

    LocationDB.find() 
        //어떤 field를 전달할 지 지정 가능 (defalut는 모든 field)
        .select('name text address latitude longitude altitude _id')
        .exec()
        .then(locations => {
            //DB가 비어있지 않은 경우 (길이로 판단)
            if(locations.length >=1){

                const response = {
                    location_data : locations.map(location => { //map() = 기존 배열을 원하는 새로운 배열로 refine
                        //여기서 return은 map() 메소드의 return
                        return {
                            name : location.name,
                            latitude : location.latitude,
                            longitude : location.longitude,
                            altitude : location.altitude,
                            text : location.text,
                            address : location.address,
                            _id : location._id,
                            
                            // 임의의 한 데이터에 대한 다음 action을 명시 (REST API의 'self-descriptive' 반영)
                            request : { 
                                type : 'GET',
                                url : process.env.URL_OF_REST + '/locations/' + location._id //url에 각 오브젝트의 URL 을 넘겨주어 구체적인 정보 확인도 가능하게 함
                            }
                        }
                    })
                }
                console.log(response);

                res.status(200).json(response);

            } else {
                // length = 0 (DB가 비어있음)
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


/** TODO
* User가 보낸 새 location 정보의 유효성 여부 판단 및 예외 처리 
* 예외 : 요구하는 field에 다른 type이 넘어온 경우, 
* 요구하는 field만큼 다 보내지 않은 경우(DB 스키마에서 "require : true"로 처리 가능)
*/
/** DB에 새로운 Location Data 저장 */
exports.location_register = (req, res, next) => {

    // User가 보낸 request 파싱
    const newLocationData = new LocationDB({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        latitude : req.body.latitude,
        longitude : req.body.longitude,
        altitude : req.body.altitude,
        text : req.body.text,
        address : req.body.address,
    });

    //DB에 저장
    newLocationData.save()
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
}


/** 특정 하나의 Location 데이터 가져옴 */
exports.location_get_one_info = (req, res, next) => {
    
    const id = req.params.locationID;

    LocationDB.findById(id)
        .select('name location_name latitude longitude altitude text address _id')
        .exec()
        .then( location => {

            /** DB에 존재하지 않아도 location이 null 값으로 전달 */
            if(location) { 
                res.status(200).json({
                    location_data : location,
                    request: {
                        type : 'GET',
                        url : process.env.URL_OF_REST + '/locations'
                        //Show all locations after showing one
                    }
                });
                
            } else {
                //id에 일치하는 값이 없는 경우 (id 값 형식은 옳음)
                res.status(404).json({
                    error : "No data fetched"
                });
                
            }
        })
        .catch(err => {
            //id 값 형식 오류
            console.log(err);
            res.status(500).json({error : err});
            
        });
    //res.status(200).json({doc}); 이 줄에 짜면 비동기로 돌아가서 먼저 res 될수도 있다 then() 실행 전
}


/** 특정 Location 데이터 수정 */
exports.location_edit_info = (req, res, next) => {
    
    const id = req.params.locationID;

    /** 항상 모든 field를 바꾸지 않을 수도 있으므로
     * 수정할 data => updateOps 변수에서 재정의하여 처리
     * User가 보낼 request 형식 : [{
     *  "propName" : 수정할 field명,
     *  "value" : 수정할 값
     * }, {}, {}, ...]
     * ex. [{"propName":"name", "value":"변경할 key의 값"}]
     */
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propName] = ops.value
    }

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


/** 특정 Location 데이터 삭제 */
exports.location_delete_one = (req, res, next) => {

    const id = req.params.locationID;

    //remove(기준) : 기준에 맞는 모든 데이터를 삭제함 (어차피 id는 unique해서 하나만 삭제)
    LocationDB.remove({_id: id})
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
