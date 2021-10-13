module.exports = {
  port: 1280,
  local: true,
  jwt: {
    scope: 'localhost',
    secret: 'secret',
    expireIn: 600000,
  },
  database: {
    prefix: 'bcms',
    fs: true,
  },
  plugins: [],
};
