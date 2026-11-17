// Emit to Socket.IO rooms created in server.js
export function emit(room, event, data) {
  globalThis.io?.to(room).emit(event, JSON.parse(JSON.stringify(data)));
}
