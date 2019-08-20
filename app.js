const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./api/routes/userRouter');
const locationRouter = require('./api/routes/locationRouter');
// const morgan = require('morgan');

//환경변수 커스터마이징을 위한 모듈
require('dotenv').config();

/** mongo DB Atlas(클라우드) 연결 설정 */
mongoose.connect(
    process.env.MONGO_ATLAS_ID + process.env.MONGO_ATLAS_PW + process.env.MONGO_ATLAS_DOMAIN,
    {
        useNewUrlParser : true
    }
);

/**
* 'morgan' = middelware for log (현재 사용 X)
* app.use(morgan('dev')); 
*/

app.use(bodyParser.urlencoded({extended: false})); // "extended : false" = 간단한 body
app.use(bodyParser.json()); // body에서 json 데이터 파싱


/** CORS문제를 해결하기 위해 response의 헤더를 조정(여기서 response X) */
app.use((req,res,next)=> {
    // header메소드의 parameter : header(key,value)
    res.header('Acess-Control-Allow-Origin','*'); //other web can access this api
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-Width, Content-Type, Accept');

    // 'OPTIONS' 메소드 = 실제 request 전 request 가능한지 여부 확인용
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});


/** Router 설정 */
app.use('/user',userRoutes);
app.use('/locations',locationRouter);


/** 
 * 잘못된 URL(에러) 핸들링
 * '/user', '/locations' 외 path로 request 처리
 */ 
app.use((req,res,next) => {
    const error = new Error('Not found');
    error.status=404;
    next(error); // 에러 핸들러 함수를 독립적으로 두기 위해
    
})

app.use((error, req,res,next) => {
    res.status(error.status || 500);
    res.json({
        error : {
            message : error.message
        }
    });
})

module.exports = app;