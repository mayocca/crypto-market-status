export default {
  NodeEnv: process.env.NODE_ENV,
  Port: process.env.PORT ?? 3000,
} as const;
