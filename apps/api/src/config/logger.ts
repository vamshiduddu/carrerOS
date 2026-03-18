const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  info: (msg: string, data?: unknown) => isDev && console.log(`[INFO] ${msg}`, data ?? ''),
  error: (msg: string, data?: unknown) => console.error(`[ERROR] ${msg}`, data ?? ''),
  warn: (msg: string, data?: unknown) => console.warn(`[WARN] ${msg}`, data ?? ''),
  debug: (msg: string, data?: unknown) => isDev && console.debug(`[DEBUG] ${msg}`, data ?? ''),
};
