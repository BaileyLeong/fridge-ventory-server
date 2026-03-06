import "dotenv/config";

export default {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ...(process.env.DATABASE_URL && {
      ssl: { rejectUnauthorized: true },
    }),
  },
};
