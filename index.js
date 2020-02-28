const express = require('express');
const socket = require('socket.io');
const path = require('path');
const port = process.env.PORT || 3000;

const app = express();
const server = app.listen(port, () => {
    console.log(`listening for requests on port ${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));

let numUsers = 0;

const io = socket(server);

io.on('connection', (socket) => {
    let addedUser = false;

    socket.on('add user', (username) => {
        if (addedUser) return;

        socket.username = username;
        ++numUsers;
        addedUser = true;

        socket.emit('login', {
            username: socket.username,
            numUsers
        });

        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers
        });
    });

    socket.on('typing', () => {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('new message', (data) => {
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    socket.on('disconnect', () => {
        if (addedUser) {
            --numUsers;

            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers
            });
        }
    });
});