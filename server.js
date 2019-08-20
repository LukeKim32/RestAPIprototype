const https = require('https');
const http = require('http');
const app = require('./app');
const fs = require('fs');

/** https 서버를 위해 CA 설정 */
const options = {
  key: fs.readFileSync(process.env.PRIVATE_KEY_PATHH),
  cert: fs.readFileSync(process.env.PUBLIC_KEY_PATHH)
};

const rest_api_server = https.createServer(options, app);

/** Socket.io 라이브러리 이용 */
const io = require('socket.io')(rest_api_server);

rest_api_server.listen(8080, '0.0.0.0', function() {
  console.log('listening');
  console.log(rest_api_server.address());
});

/** Socket 통신 처리 핸들러 */
const socketIOHandler = require('./api/routes/socketRouter')(io);

/** TODO
 * 1. http 서버도 만들어서 https로 redirection
 */
