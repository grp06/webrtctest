var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT);

io.on('connection', function(socket) {
  socket.on('join', function (data) {
    const sockets = io.of('/').in().adapter.rooms;

    let myRoom
    const joinRoom = () => {
      for (const key in sockets) {
        if (sockets.hasOwnProperty(key)) {
          const room = sockets[key];
          console.log('room = ', room)
          if (key.length === 7 && room.length === 1) {
            socket.join(key);
            myRoom = key
            console.log('joining an existing room ', key)
            io.to(key).emit('welcomeMessage', {
              waitingForPartner: false,
              roomId: key,
            })
          }
        }
      }

      if (!myRoom) {
        myRoom = data.roomId
        console.log('creating room with ID ', myRoom )
        socket.join(myRoom);
        io.to(myRoom).emit('welcomeMessage', {
          waitingForPartner: true,
          roomId: myRoom,
          process: process.env.PORT
        })
      }
    }
    joinRoom()

    socket.on('chat', function(data) {
      io.to(myRoom).emit('chat', data)
    })

    socket.on('typing', function(data) {
      socket.broadcast.emit('typing', data)
    })


})

