const jwt = require('jsonwebtoken');
const User = require('../models/user');
const cookie = require('cookie');

const initializeSocket = (io) => {
  const rooms = {};
  const socketToRoomMap = {};

  const closeRoom = (roomId, reason) => {
    const room = rooms[roomId];
    if (!room) return;

    console.log(`Closing room ${roomId}. Reason: ${reason}`);
    delete rooms[roomId];
    io.to(roomId).emit('collab-session-ended', { reason });
    io.in(roomId).disconnectSockets(true);
    
    console.log(`Room ${roomId} has been closed.`);
  };

  io.use(async (socket, next) => {
    console.log(`[Socket Auth] Attempting to authenticate socket ${socket.id}...`);
    const cookieStr = socket.handshake.headers.cookie;
    if (!cookieStr) {
      console.error('[Socket Auth] Error: No cookie provided in handshake headers.');
      return next(new Error('Authentication error: No cookie provided.'));
    }

    const cookies = cookie.parse(cookieStr);
    const token = cookies.token;

    if (!token) {
      console.error('[Socket Auth] Error: "token" not found in parsed cookies.');
      return next(new Error('Authentication error: No token provided.'));
    }

    try {
      if (!process.env.JWT_SECRET) {
        console.error('[Socket Auth] FATAL: JWT_SECRET environment variable is not set!');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.error(`[Socket Auth] Error: User not found for decoded ID: ${decoded.id}`);
        return next(new Error('Authentication error: User not found.'));
      }
      socket.user = user;
      console.log(`[Socket Auth] Success: Authenticated user ${user.UserName} (${socket.id})`);
      next();
    } catch (err) {
      console.error('[Socket Auth] Error: JWT verification failed.', err);
      return next(new Error('Authentication error: Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.user.UserName} (${socket.id})`);
    socket.join(socket.user._id.toString());

    socket.on('join-room', ({ roomId }) => {
      const userPayload = {
        _id: socket.user._id,
        UserName: socket.user.UserName,
        email: socket.user.email
      };

      socket.join(roomId);
      
      const isNewRoom = !rooms[roomId];
      if (isNewRoom) {
        rooms[roomId] = { users: {}, code: '', host: socket.id };
      }

      rooms[roomId].users[socket.id] = userPayload;
      socketToRoomMap[socket.id] = roomId; 
      if (!isNewRoom) {
        socket.emit('code-update', rooms[roomId].code);
      }

      io.to(roomId).emit('users-update', { users: rooms[roomId].users, hostId: rooms[roomId].host });
      console.log(`${userPayload.UserName} joined room ${roomId}`);
    });

    socket.on('code-change', ({ roomId, code }) => {
      if (rooms[roomId]) {
        rooms[roomId].code = code;
        socket.to(roomId).emit('code-update', code);
      }
    });

    socket.on('cursor-move', ({ roomId, cursorPosition }) => {
      socket.to(roomId).emit('cursor-update', {
        socketId: socket.id,
        user: { 
          _id: socket.user._id,
          UserName: socket.user.UserName,
          email: socket.user.email
        },
        cursorPosition
      });
    });

    socket.on('chat-message', ({ roomId, text }) => {
      const message = {
        user: {
          _id: socket.user._id,
          UserName: socket.user.UserName,
          email: socket.user.email
        },
        text: text,
        timestamp: new Date()
      };
      io.to(roomId).emit('new-chat-message', message);
    });

    socket.on('end-session', ({ roomId }) => {
      const room = rooms[roomId];
      if (!room) return;
      if (room.host === socket.id) {
        closeRoom(roomId, 'The host has ended the session.');
      } else {
        socket.emit('session-error', { message: 'Only the host can end the session.' });
      }
    });

    socket.on('leave-session', ({ roomId }) => {
      const room = rooms[roomId];
      if (!room || !room.users[socket.id]) {
        socket.emit('session-left-successfully');
        return;
      }
      if (room.host === socket.id) {
        socket.emit('session-error', { message: 'Host must use "End Session" to close the room for everyone.' });
        return;
      }
      const leavingUser = room.users[socket.id];
      console.log(`Participant ${leavingUser.UserName} is leaving room ${roomId}`);
      delete room.users[socket.id];
      delete socketToRoomMap[socket.id];
      socket.leave(roomId);
      io.to(roomId).emit('users-update', { users: room.users, hostId: room.host });
      socket.emit('session-left-successfully');
    });

    socket.on('disconnect', () => {
      console.log(`A user disconnected: ${socket.user?.UserName || socket.id}`);
      const roomId = socketToRoomMap[socket.id];
      delete socketToRoomMap[socket.id];

      const room = rooms[roomId];
      if (!roomId || !room) {
        return;
      }

      if (room.host === socket.id) {
        closeRoom(roomId, 'The host has left the session.');
      } else if (room.users[socket.id]) {
        delete room.users[socket.id];
        io.to(roomId).emit('users-update', { users: room.users, hostId: room.host });
      }
    });
  });
};

module.exports = initializeSocket;