import mysql from 'mysql2/promise';
import { getDbConfig } from './db-config.mjs';

function getPool() {
  if (!globalThis._pool) {
    globalThis._pool = mysql.createPool(getDbConfig());
  }

  return globalThis._pool;
}

export const db = {
  query(...args) {
    return getPool().query(...args);
  },
  getConnection() {
    return getPool().getConnection();
  },
};