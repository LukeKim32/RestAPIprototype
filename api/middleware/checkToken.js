const jwt = require('jsonwebtoken');
//req will be automatically passed without explicit parameter passing

//we will verify token
module.exports = (req, res, next) => {
    //decode() : only helpful after verification
    //verify() : verify & decode
    try{
        const token = req.headers.authorization.split(' ')[1];
        //token is sent by request header : "authorization" : "Bearer token"
        console.log(token);
        //req.body.token can cause error, if the req body isnt parsed
        const decoded = jwt.verify(token, process.env.JWT_HASH);
        //if verify() fails, it will make error
        req.userData = decoded; //add userData
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: 'Token Auth failed'
        });
    }
    
};