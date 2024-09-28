const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(             //io.sockets.adapter ke andr bohot sare rooms hoskte he to unmse se jo roomId vala room he vo get hojaygi
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

  
    
    socket.on('join', ({ roomId, username }) => {      //client se roomId or username milra he
        userSocketMap[socket.id] = username;           //store in map socketid->username   ,same roomid vale he vo same room me aayge 
        socket.join(roomId);                           
        const clients = getAllConnectedClients(roomId);

        //notify to all user that new user has joined with the same roomId 
        clients.forEach(({socketId})=>{
             io.to(socketId).emit('joined',{            //hm sare connected clients ki info send krrehe ,jisse frontend me connected users show honge side baar
                clients,
                username,
                socketId:socket.id,
             });
        })
    });
    socket.on('code-change',({roomId,code})=>{
        socket.in(roomId).emit('code-change',{code});

    });
    socket.on("sync-code",({socketId,code})=>{                 //agr new user connect hua to jo editor pr already changes the use show honge isse
        io.to(socketId).emit("code-change",{code});              // emit changes for particular user who have socketId as provided
    });
     // Handle adding comments
     socket.on('add-comment', ({ roomId, comment }) => {
        console.log("New comment received:", comment); // Log the comment
        io.to(roomId).emit('add-comment', { comment });
    });
    socket.on('chat-message', ({ username, message }) => {
        console.log(`${username} sent a message: ${message}`);
        io.to([...socket.rooms][1]).emit('chat-message', { username, message });
    });

    socket.on('disconnecting', () => {
        const rooms =[...socket.rooms];
        rooms.forEach((roomId)=>{
          socket.in(roomId).emit('disconnected',{
              socketId:socket.id,
              username:userSocketMap[socket.id],
          });
        });
        delete userSocketMap[socket.id];
        socket.leave();
      });
  
});

const PORT=process.env.PORT||5000;
server.listen(PORT, () => 
    console.log('Server is running on port 5000')
);