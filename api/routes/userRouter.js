const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/** REST API : Stateless하므로 User의 Login 유지 여부 관심 X (Login은 가능)
 * = Logout 기능 X (= Login 시 토큰 발행)
 */
router.post('/signup', userController.signup);
router.post('/login',userController.login);
router.delete('/:userId',userController.delete_user)

/** 처리한 path 외 path 에러 처리 */
router.all('/',(req,res,next)=>{
    console.log("Invalid Request URL");
    res.status(404).json({
        message : "Check the proper API usage",
        url : "http://I-have-to-register-API-document"
        
    })
})


module.exports = router;