import { Server } from 'socket.io';

// Initialize a Socket.IO server instance
const io = new Server(42069); // Listen on port 3000

// Handle connection events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle message events and echo them back to the client
  socket.on('message', (message) => {
    console.log('Received message:', message);
    socket.send(`Echo: ${message}`);
  });

  // Handle disconnection events
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

console.log('WebSocket server is running on port 42069');