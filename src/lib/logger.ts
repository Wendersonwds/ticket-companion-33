// Lightweight logger that suppresses internal details in production builds.
// In production, only generic messages are emitted (no table names, no DB errors).
const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (publicMessage: string, ..._internal: unknown[]) => {
    // Always surface a generic message; internal details only in dev.
    if (isDev) console.error(publicMessage, ..._internal);
    else console.error(publicMessage);
  },
};
