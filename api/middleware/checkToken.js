const jwt = require('jsonwebtoken');

/** 토큰 확인 */
module.exports = (req, res, next) => {
    /** 기능
     * decode() : only helpful after verification 
     * verify() : verify & decode
    */
    try{
        // request 헤더 : {"authorization" : "Bearer 토큰값"} 형식
        const token = req.headers.authorization.split(' ')[1];
       
        console.log(token);

        const decoded = jwt.verify(token, process.env.JWT_HASH); //if verify() fails, it will make error
        
        req.userData = decoded; //request의 'userData' 에 담아서 전달
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: 'Token Auth failed'
        });
    }
    
};