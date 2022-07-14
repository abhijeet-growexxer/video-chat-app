const express = require("express");
const app = express();
const http = require('http');
const {v4: uuidv4} = require('uuid');
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);

app.use(express.static('public'));

//setting the Template Engine
app.set(`view engine`, `ejs`);

const io = require("socket.io")(server,{
    cors:{
        origin:'*'
    }
});

app.get('/',(req,res)=>{
    res.render('user')
});
app.get('/room/',(req,res)=>{
    res.redirect(`/room/${uuidv4()}`);
});
app.get('/room/:roomId',(req, res)=>{
    res.render('room',{roomId:req.params.roomId});  
});

io.on("connection",(socket)=>{
    // console.log(socket)
    socket.on("join-room",(roomId,userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);
        socket.on('disconnect',() => {
            socket.broadcast.to(roomId).emit("user-disconnected", userId);
        })
    });
    
})

server.listen(PORT,console.log(`Server started at PORT:${PORT}`));