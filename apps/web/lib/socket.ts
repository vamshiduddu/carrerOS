import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

const WS_URL =  'ws://localhost:3001';

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(WS_URL, {
      auth: { token: getToken() ?? '' },
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000
    });
  }
  return _socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  _socket?.disconnect();
}
