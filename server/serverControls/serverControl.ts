import app from '../app';

import { Server } from 'http';
let server: Server | null = null;
const port = process.argv[2] ?? 3031;

export const startServer = (): Server => {
  if (!server) {
    server = app.listen(port, () => {
      console.log(`Server starting on port ${port}`);
    });
  }
  return server;
};

export const stopServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close(err => {
        if (err) {
          console.error('Error closing server', err);
          reject(err);
          return;
        }
        console.log('Server closed');
        server = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
};

export const getServer = (): Server | null => {
  return server;
};
