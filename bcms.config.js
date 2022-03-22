module.exports = {
  port: 8080,
  local: true,
  jwt: {
    scope: 'localhost',
    secret: 'secret',
    expireIn: 5000,
  },
  database: {
    prefix: 'bcms',
    fs: true,
  },
  plugins: [],
  bodySizeLimit: 102400000000
};
