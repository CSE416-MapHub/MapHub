import { getServer, stopServer } from './serverControl';
import mongoose from 'mongoose';

module.exports = async () => {
  console.log('CLOSING SEREVRE');
  await stopServer();
  console.log(getServer());
};
