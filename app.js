const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
//spin up express application
//morgan is middleware for log - aintworkin!
const userRoutes = require('./api/routes/userRouter');
const locationRouter = require('./api/routes/locationRouter');
require('dotenv').config();

mongoose.connect(
    process.env.MONGO_ATLAS_ID + process.env.MONGO_ATLAS_PW + process.env.MONGO_ATLAS_DOMAIN,
    {
        useNewUrlParser : true
    }
);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
//extended is for rich body, false = simple body
app.use(bodyParser.json());
//extract json data and make easily readable



//CORS문제를 해결하기 위해 response의 헤더를 adjust. 이건 response를 보내는게 아니다
app.use((req,res,next)=> {
    res.header('Acess-Control-Allow-Origin','*'); //other web can access this api
    //first : second parameter = key : value
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-Width, Content-Type, Accept');
    if(req.method === 'OPTIONS'){
        //browser always send options request first before real request to check if request is possible
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next(); //if we not return or end, we have to next() to pass the handle
});


//incoming request goes to app.use = middleware
//can be function, or router(filter)
// '/products'로 시작하는 url을 productRoutes로 라우팅할 것
app.use('/user',userRoutes);
app.use('/locations',locationRouter);

app.use((req,res,next) => {
    const error = new Error('Not found');
    error.status=404;
    next(error);
    //forward this error
})
//설정한 router외 모든 것을 error라고 가정

app.use((error, req,res,next) => {
    res.status(error.status || 500);
    res.json({
        error : {
            message : error.message
            //ex. error.message는 설정 가능, 위에서 'not found' 처럼
        }
    });
})
//handle all kinds of error, 이 앱 다른곳에서 발생한 모든 에러 다 handle! ex. DB operation fails

//url 경로에 대한 error handling(예외처리도 해야함)
module.exports = app;
