const LocSocketDB = require('../models/locationSocketDB');
const mongoose = require('mongoose');


module.exports = function(io) {
    io.on('connection', (socket)=> {
        const socketController = require('../controllers/socketController');
        console.log("SOCKETIO connection EVENT: ", socket.id, " client connected");
        // 여기서부터 socket에 대한 이벤트를 작성하면 된다.
        // socket.on("Get_All", socketController.getall(socket));

        socket.on("Client_Register",socketController.register(socket));

        socket.on("Client_Update",socketController.update(socket));

        // socket.on("DELETE",socketController.delete(socket));
    })
};