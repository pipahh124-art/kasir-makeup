export function getDbConfig(env = process.env) {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to connect to the MySQL database.');
  }

  let url;

  try {
    url = new URL(env.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL must be a valid MySQL connection URL.');
  }

  const database = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  const user = decodeURIComponent(url.username);

  if (url.protocol !== 'mysql:' || !url.hostname || !user || !database) {
    throw new Error('DATABASE_URL must include mysql://, a username, host, and database name.');
  }

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user,
    password: decodeURIComponent(url.password),
    database,
    dateStrings: true,
  };
}
