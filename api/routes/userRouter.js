const express = require('express');
const router = express.Router();

//sign up, sign in needed. no logout - we don't store whether user is logged in

const userController = require('../controllers/userController');

router.post('/signup', userController.signup);

router.post('/login',userController.login);

router.delete('/:userId',userController.delete_user)

router.all('/',(req,res,next)=>{
    console.log("Invalid Request URL");
    res.status(404).json({
        message : "Check the proper API usage",
        url : "http://I-have-to-register-API-document"
        
    })
})


module.exports = router;