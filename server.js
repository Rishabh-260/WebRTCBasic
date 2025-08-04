const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname));

io.on('connection', socket => {
    console.log('New connection:', socket.id);

    socket.on('signal', (data) => {
        // broadcast signal to everyone except the sender
        socket.broadcast.emit('signal', data);
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
