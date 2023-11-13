export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
  SECRET: process.env.SECRET,
  URL_MONGODB: process.env.URL_MONGODB,
  TZ:   process.env.TZ || "America/Bogota"
});
