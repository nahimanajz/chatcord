const path = require('path');
const http = require('http');
const express  = require('express');
// const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { getCurrentUser, getRoomUsers, userJoin, userLeave} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);
app.get('/api', function(req, res){
   res.send('welcome');
})
//set static folder----------
app.use(express.static(path.join(__dirname, 'public')))
const botName = `Chat Bot`;
//run when client connects
io.on('connection',socket =>{
     //user join
     socket.on('joinRoom',({username,room})=>{         
        const user = userJoin(socket.id, username,room);
        socket.join(user.room);

       //Welcome current user
       socket.emit('message',formatMessage(botName,'welcome to ChatCord'));

       //Broadcast when a user connects
       socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));
     
       //send users and room info
       io.to(user.room).emit('Room users',{room: user.room, roomUsers: getRoomUsers(user.room)});
       const users = getRoomUsers(user.room);
      
      });
   
   //Listen for chat message from form
   socket.on('chatMessage', msg =>{
    const user  = getCurrentUser(socket.id);
    io.to(user.room).emit('message',formatMessage(`${user.username}`,msg));
   });

   //Run when client disconnects
   socket.on('disconnect',()=> {
       const user = userLeave(socket.id);
       if(user) {
           io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
          
           //send users and room info
          io.to(user.room).emit('Room users',{room: user.room, roomUsers: getRoomUsers(user.room)});

       }
   });
});
const PORT = 3000 || process.env.PORT;
server.listen(PORT,()=> console.log(`server is running on ${PORT}`));
