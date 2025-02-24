import "dotenv/config";

export default {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: "utf8",
  },
  pool: {
    min: 2,
    max: 5,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
  },
};
