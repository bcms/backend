module.exports = {
  port: 1280,
  security: {
    jwt: {
      issuer: 'localhost',
      secret: 'secret',
      expireIn: 30000000,
    },
  },
  database: {
    fs: 'bcms',
  },
  plugins: [],
};
