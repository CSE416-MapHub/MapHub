import app from '../index';
import http from 'http';

let server: http.Server;
const port = process.argv[2] ?? 3031;

export const startServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    server = app
      .listen(port, () => {
        console.log(`Server is running on port ${port}`);
        resolve();
      })
      .on('error', reject);
  });
};

export const stopServer = (): Promise<void> => {
  return new Promise(resolve => {
    server.close(() => {
      resolve();
    });
  });
};
