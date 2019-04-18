var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var axios = require('axios');

var ipApi = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=';
var message = [];
var users   = [];
var msgId 	= 99999;

io.on('connection', socket => {
	socket.ip = socket.handshake.address.match(/\d+\.\d+\.\d+\.\d+/);
	if( socket.ip )
	{
		axios.get(`${ipApi}${socket.ip}`)
		.then(responseData => {
			var data = responseData.data;
			if( data != -3 && data.ret != -1 ) return socket.locality = data;
			socket.locality = {};
		})
		.catch(err => {
			socket.locality = {};
		});
	}

	// 监听用户登录
	socket.on('login', data => {
		console.log('login');
		var userObj = Object.assign(data, {sign: socket.id, type: 'online'});
		users.push(userObj);
		io.sockets.emit('login', {
			data: {
				users, 
				online: userObj,
			}
		});
	})

	// 客户端断开连接
	socket.on('disconnect', () => {
    var index = users.findIndex(el => el.sign == socket.id);
		if( index >= 0 )
		{
			io.sockets.emit('offline', Object.assign(users[index], {type: 'offline'}));
			users.splice(index, 1);
			io.sockets.emit('update', users);
		}
	})

	// 收到客户端发来的消息
	socket.on('message', data => {
		var msg = Object.assign(data, {msgId: msgId++, locality: socket.locality});
		message.push(msg);
		io.sockets.emit('message', msg);
	})

})
http.listen(3001);

