// Custom server: Next.js + Socket.IO in one process (needed for real-time KDS & live stock sync)
// Dev:  npm run dev     Prod: npm run build && npm start   (works on Windows too — no env-var syntax needed)
import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';

const prod = process.argv.includes('--prod') || process.env.NODE_ENV === 'production';
const dev = !prod;
const port = parseInt(process.env.PORT || '3000', 10);

// Create the HTTP server first and hand it to Next so Next's own HMR websocket keeps working next to Socket.IO.
let handle;
const httpServer = createServer((req, res) => handle(req, res));
const app = next({ dev, httpServer, port });
handle = app.getRequestHandler();
await app.prepare();

const io = new Server(httpServer, { cors: { origin: '*' }, serveClient: false });
globalThis.io = io;

io.on('connection', (socket) => {
  // Staff join their restaurant room; guests join the public menu room
  socket.on('join:restaurant', (id) => socket.join(`restaurant:${id}`));
  socket.on('join:menu', (slug) => socket.join(`menu:${slug}`));
  socket.on('join:order', (id) => socket.join(`order:${id}`));
});

httpServer.listen(port, () => console.log(`> OmniBite ready on http://localhost:${port} (${dev ? 'development' : 'production'})`));
