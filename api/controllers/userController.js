const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../models/userDB');
const LocSocketDB = require('../models/locationSocketDB');

exports.signup = (req,res,next)=>{
    //check if user data exists
    User.find({email : req.body.email})
        .exec()
        .then(user => {
            if(user.length >= 1) { //if no user exists, it will return empty array so
                //we compare with length
                return res.status(409).json({
                    message : 'Mail exists'
                })
            } else{
                if(!req.body.password){
                    res.status(401).json({
                        message : 'Password should be passed, Check the API for usage',
                        url : "http://I-have-to-register-API-document"
                    })
                } else {
                    bcrypt.hash(req.body.password, 10, (err, hash_password) =>{
                        if (err){
                            return res.status(401).json({
                                error : err
                            });
                        } else {
                            bcrypt.hash(req.body.email+process.env.LOC_SOC_HASH,10,(err,hash_locSocDB_id)=> {
                                if (err){
                                    return res.status(401).json({
                                        error : err
                                    });
                                }else{
                                    const user = new User({
                                        _id : new mongoose.Types.ObjectId(),
                                        email : req.body.email,
                                        password : hash_password,
                                        locsoc_id : hash_locSocDB_id
                                    });
                                    user.save()
                                        .then(result => {
                                            console.log(result)
                                            const person = new LocSocketDB({
                                                _id: hash_locSocDB_id,
                                                name: req.body.email,
                                                xyz : [],
                                                viewM : [],
                                            });
                                            person.save()//미리 생성해놓고 나중에 수정하는 방향...고민..
                                                .then(result => {
                                                    res.status(201).json({
                                                        message : 'User created',
                                                        request : {
                                                            type : 'POST',
                                                            url : process.env.URL_OF_REST + "/user/login"
                                                        }
                                                    });
                                                }).catch(err => {
                                                    res.status(500).json({
                                                       error : err
                                                    })
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
                        //salt means adding random string to plain text and then hash
                        //if password is like 'icecream', can be searched mapped hash data with it
                        //really bad security
                        //we store raw password in plain textform db, so we'll encrypt by bcrypt
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

exports.login = (req,res,next)=>{
    User.find({email : req.body.email})
        .exec()
        .then( user=> {
            if(user.length < 1){
                return res.status(401).json({
                    message : 'Auth failed'
                    //message : 'Mail not foudn, user doesn\'t exist'
                    //hacker can get get availiable user id list by this
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                //bcrypt.comapre(plaintext of password, hash, callback)
                if(err){
                    return res.status(401).json({
                        message : 'Auth failed'
                    })
                }
                if(result){
                    const token = jwt.sign({
                        email : user[0].email,
                        userId : user[0]._id
                    }, 
                    process.env.JWT_HASH,
                    {
                        expiresIn : "1h"
                    });
                    
                    //payload : data to pass
                    return res.status(200).json({
                        message : 'Auth succesful',
                        locsoc_id : user[0].locsoc_id,
                        token : token, //token is encoded not encrypted!
                        //if user gets token data, we can check in jwt website
                        request : {
                            type : 'GET',
                            url : process.env.URL_OF_REST + "/locations"
                        }
                    })
                }
                res.status(401).json({
                    message : 'Auth failed'
                    //check and unify status code and message for security
                })
            }
                
            );
        })
        .catch(err => {
            res.status(500).json({
            error : err
        })
    })
}

exports.delete_user = (req,res,next)=>{
    //req.body is for sending data(POST), req.params is for extracting data
    //req.params is in url, so theres length limit
    User.remove({_id : req.params.userId})
        .exec()
        .then(result => {
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