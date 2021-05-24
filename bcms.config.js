const pluginName = 'hello-world';
process.env.VUE_APP_PLUGIN_NAME = pluginName;

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
  plugins: [pluginName],
};
