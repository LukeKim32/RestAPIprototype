const socketController = require('../controllers/socketController');
const objectController = require('../controllers/objectController');

module.exports = function(io) {
    io.on('connection', (socket)=> {
        console.log("SOCKETIO connection EVENT: ", socket.id, " client connected");
        // 여기서부터 socket에 대한 이벤트를 작성하면 된다.

        /** DB 내 모든 유저들의 데이터 가져옴 */
        socket.on("Client_GetAll",socketController.getAll(socket));

        /** User가 자신의 새 GPS 정보 보냄 => DB 수정  */
        socket.on("Client_Update",socketController.update(io, socket));

        /** 3D 렌더링할 오브젝트 ==> DB 추가 */
        socket.on("Client_Add_Andy", objectController.addAndy(io, socket));

    })
};