module.exports = {
  port: 1280,
  jwt: {
    scope: 'localhost',
    secret: 'secret',
    expireIn: 30000000,
  },
  database: {
    prefix: 'bcms',
    fs: true,
  },
  plugins: [],
};
