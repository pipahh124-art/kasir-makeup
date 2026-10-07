import mysql from 'mysql2/promise';
import { getDbConfig } from './db-config.mjs';

export const db = (globalThis._pool ||= mysql.createPool({
  ...getDbConfig(),
}));