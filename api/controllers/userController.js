const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserDB = require('../models/userDB');

/** 회원가입 (비밀번호 값 hash 후 DB에 저장) */
exports.signup = (req,res,next)=>{

    // 회원가입 용 email ==> DB내 이미 존재하는지 확인
    UserDB.find({email : req.body.email})
        .exec()
        .then(users => {
            if(users.length >= 1) { // length = 0 (DB에 없을 경우, empty []가 온다 )

                return res.status(409).json({
                    message : 'Mail exists'
                })
            } else {
                //회원가입 시 password 미입력한 경우
                if(!req.body.password){
                    res.status(401).json({
                        message : 'Password should be passed, Check the API for usage',
                        url : "http://I-have-to-register-API-document"
                    })
                } else {
                    /** 회원가입용 password 암호화
                     * .hash(password, 'salt', 콜백)
                     * 'salt' = 'password'에 랜덤 문자열을 더함 + hashing  
                     */ 
                    bcrypt.hash(req.body.password, 10, (err, hash_password) =>{
                        if (err){
                            return res.status(401).json({
                                error : err
                            });
                        } else {
                            //DB에 저장하기 위해 JSON data 형식
                            const newUser = new UserDB({
                                    _id : new mongoose.Types.ObjectId(),
                                    email : req.body.email,
                                    password : hash_password,
                                    nickname : req.body.nickname,
                                    xyz : [],
                                    viewM : []
                            });
                            
                            //DB에 저장
                            newUser.save()
                                .then(result => {
                                    console.log(result)
                                    res.status(201).json({
                                    message : 'User created',
                                    request : {
                                        type : 'POST',
                                        url : process.env.URL_OF_REST + "/user/login"
                                        }
                                    });
                                })
                                .catch(err => {
                                    res.status(500).json({
                                       error : err
                                    })
                                });
                        }
                    })
                }
            }
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({
                error : err
            })
        })
}


/** 로그인 (=> 토큰 발행) */
exports.login = (req,res,next)=>{

    // 로그인 용 email ==> DB내 존재하는지 확인
    UserDB.find({email : req.body.email})
        .exec()
        .then( user=> {
            if(user.length < 1){ // length = 0 (회원가입이 되어 있지 않은 경우)

                return res.status(401).json({
                    message : 'Auth failed'
                    // 에러 메시지를 email이 없다고 명시할 경우, hacker들이 유저들의 email 리스트를 획득하는 정보가 될 수 있다.
                });
            }
            
            /** .compare() : hash된 값과 plain text의 비교를 가능하게 해줌
             * DB에서 가져온 user[0].password = 해쉬된 값
             * req.body.password = plain text
             */
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                //비밀번호가 다른 경우
                if(err){ 
                
                    return res.status(401).json({
                        message : 'Auth failed'
                    })
                }

                //비밀번호가 일치한 경우
                if(result){
                    //토큰 발행 (옵션으로 expire 기간 설정)
                    const token = jwt.sign({
                        email : user[0].email,
                        userId : user[0]._id
                    }, 
                    process.env.JWT_HASH,
                    {
                        expiresIn : "1h"
                    });
                    
                    return res.status(200).json({
                        message : 'Auth succesful',
                        _id : user[0]._id,
                        nickname : user[0].nickname,
                        token : token, //토큰 자체가 암호화되어있지 않음 => "jwt 모듈 웹사이트"에서 확인 가능
                        request : {
                            type : 'GET',
                            url : process.env.URL_OF_REST + "/locations"
                        }
                    })
                }

                //이 외 경우 : 보안을 위해 에러 응답 코드와 메세지 통일
                res.status(401).json({
                    message : 'Auth failed'
                    
                })
            });
        })
        .catch(err => {
            res.status(500).json({
            error : err
        })
    })
}

/** 회원정보 삭제 */
exports.delete_user = (req,res,next)=>{
    /** req.body가 아닌 req.params에서 id 값 추출
     * body에 보낼 경우 : POST 메소드 = 데이터 크기에 따라 전송의 오버헤드 발생
     * params에 보낼 경우 : 데이터 크기(길이) 제한은 있지만 간단한 데이터 전송에 용이
     * ==> 유저 delete의 경우 url로 id 값을 전달받고 있기 때문이다.
     */
    UserDB.remove({_id : req.params.userId})
        .exec()
        .then(result => {
            //이 {}에 들어올 경우 DB에서 삭제가 성공 = 따로 result 확인 X
            res.status(200).json({
                message : 'User deleted'
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error : err
            })
        })
}