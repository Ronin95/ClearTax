const envOrThrow = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

export const apiConfig = {
  port: process.env.PORT || 3000,
  jwtSecret: envOrThrow("JWT_SECRET"),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'cleartax_user',
    password: process.env.DB_PASSWORD || 'cleartax_password',
    database: process.env.DB_NAME || 'cleartax_db',
  }
};
