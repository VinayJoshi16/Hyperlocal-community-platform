// server.js - entry point. Starts the HTTP server, verifies the database
// connection, and initializes Socket.io for real-time events.
// Run with: npm run dev (development) or npm start (production)

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const config = require('./src/config/env');
const { testConnection } = require('./src/config/db');
const { startKeepAlive } = require('./src/utils/keepAlive');

const server = http.createServer(app);

// ─── Socket.io setup ──────────────────────────────────────────────────────────
// Socket.io sits alongside the Express app on the same HTTP server.
// When you add Redis later, swap the in-memory adapter for @socket.io/redis-adapter
// (one line change) to support multiple Node.js instances.

const io = new Server(server, {
  cors: {
    origin: [config.clientUrl, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Make io accessible inside controllers without circular imports
// Usage: const io = req.app.get('io'); io.to('room').emit('event', data)
app.set('io', io);

// ─── Socket.io connection handling ────────────────────────────────────────────

io.on('connection', (socket) => {
  if (config.nodeEnv === 'development') {
    console.log(`Socket connected: ${socket.id}`);
  }

  // Client sends their location IDs after connecting so the server
  // can put them in the right rooms for targeted broadcasts.
  socket.on('join_locations', ({ locationIds }) => {
    if (!Array.isArray(locationIds)) return;

    locationIds.forEach((id) => {
      if (typeof id === 'string' && id.length > 0) {
        socket.join(`location:${id}`);
      }
    });

    if (config.nodeEnv === 'development') {
      console.log(`Socket ${socket.id} joined rooms:`, locationIds.map((id) => `location:${id}`));
    }
  });

  socket.on('leave_location', ({ locationId }) => {
    socket.leave(`location:${locationId}`);
  });

  socket.on('disconnect', (reason) => {
    if (config.nodeEnv === 'development') {
      console.log(`Socket disconnected: ${socket.id} — ${reason}`);
    }
  });
});

// ─── Broadcast helpers ────────────────────────────────────────────────────────

function broadcastNewPost(locationId, post) {
  io.to(`location:${locationId}`).emit('new_post', post);
}

function broadcastEmergency(locationId, post) {
  io.to(`location:${locationId}`).emit('emergency_alert', {
    ...post,
    _priority: 'high',
  });
}

// ─── Start server ─────────────────────────────────────────────────────────────

async function start() {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error(
      'Server startup aborted: could not connect to the database.\n' +
      'Check DATABASE_URL in your .env file.'
    );
    process.exit(1);
  }

  server.listen(config.port, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║        NeighbourHub API - Running        ║
  ╠══════════════════════════════════════════╣
  ║  Port   : ${String(config.port).padEnd(30)}║
  ║  Env    : ${String(config.nodeEnv).padEnd(30)}║
  ║  DB     : Neon PostgreSQL (connected)    ║
  ║  Sockets: Socket.io ready                ║
  ╚══════════════════════════════════════════╝
    `);
    
    // Start keep-alive ping on Render
    startKeepAlive();
  });
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

start();

module.exports = { broadcastNewPost, broadcastEmergency };