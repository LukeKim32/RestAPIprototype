const LocSocketDB = require('../models/locationSocketDB');
const mongoose = require('mongoose');


module.exports = function(io) {
    io.on('connection', (socket)=> {
        const socketController = require('../controllers/socketController');
        
        console.log("SOCKETIO connection EVENT: ", socket.id, " client connected");
        // 여기서부터 socket에 대한 이벤트를 작성하면 된다.
        // socket.on("Get_All", socketController.getall(socket));

        //현재 userDB에 회원가입시 자동으로 등록을 함에 따라 register()는 이용되고 있지 않다.
        socket.on("Client_Register",socketController.register(io, socket));
        socket.on("Client_GetAll".socketController.getAll(socket));
        socket.on("Client_Update",socketController.update(io, socket));

        // socket.on("DELETE",socketController.delete(socket));
    })
};