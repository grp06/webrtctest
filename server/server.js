var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 8080);

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
          roomId: myRoom
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

    // if (sockets.length===1) {
    //   console.log('length = 1')
    //   socket.emit('init')
    // } else{
    //   if (sockets.length===2){
    //     console.log("sockets length 2")
    //     io.to(data.roomId).emit('ready')
    //   } else {
    //     console.log("sockets not 1 or 2 ... I guess we leave here and emit full?")
    //     socket.room = null
    //     socket.leave(data.roomId)
    //     socket.emit('full')
    //   }
    // }
  });



  // const mySocketId = socket.id
  // listOfSocketIds.push(mySocketId)




  // socket.on('disconnect', function(){
  //   const index = listOfSocketIds.indexOf(mySocketId);
  //   if (index > -1) {
  //     listOfSocketIds.splice(index, 1);
  //   }
  // });



})

