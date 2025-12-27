const envOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export const apiConfig = {
  port: process.env.PORT || 3000,
  jwtSecret: envOrThrow("JWT_SECRET"),
  immudb: {
    host: process.env.IMMUDB_HOST || 'immudb',
    port: parseInt(process.env.IMMUDB_PORT || '3322'),
    user: process.env.IMMUDB_USER || 'immudb',
    password: process.env.IMMUDB_PASSWORD || 'immudb',
    database: 'defaultdb'
  }
};
