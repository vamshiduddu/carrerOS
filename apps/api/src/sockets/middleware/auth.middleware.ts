import { verifyAccessToken } from '../../utils/jwt';

export function socketAuthMiddleware(socket: any, next: (err?: Error) => void) {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyAccessToken(token);
    socket.data.userId = payload.sub;
    socket.data.email = payload.email;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
}
