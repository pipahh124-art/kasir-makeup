export function getDbConfig(env = process.env) {
  if (env.DATABASE_URL) {
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

  const required = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Database configuration is missing: ${missing.join(', ')} or DATABASE_URL.`);
  }

  const port = Number(env.DB_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT must be an integer between 1 and 65535.');
  }

  return {
    host: env.DB_HOST,
    port,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    dateStrings: true,
  };
}
