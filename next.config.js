// const nextConfig = {
//   /* config options here */
//   reactCompiler: true,
// };
// next.config.js
// next.config.js
const nextConfig = {
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,         // check for changes every second
      aggregateTimeout: 300,
    };
    return config;
  },
};
