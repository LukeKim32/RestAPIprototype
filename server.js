const https = require('https');
const http = require('http');
const app = require('./app');
const fs = require('fs');


const options = {
  key: fs.readFileSync(process.env.PRIVATE_KEY_PATHH),
  cert: fs.readFileSync(process.env.PUBLIC_KEY_PATHH)
};

const rest_api_server = https.createServer(options, app);
const io = require('socket.io')(rest_api_server);
rest_api_server.listen(8080, '127.0.0.1', function() {
  console.log('listening');
  console.log(rest_api_server.address());
});
const socketIOHandler = require('./api/routes/socketRouter')(io);


//const port = process.env.port || 3000;
//const port = 8080;
//const server = https.createServer(app);

//server.listen(port, '0.0.0.0', function() {
//	console.log('listening');
//	console.log(server.address());
//});

//console.log(server.address());
