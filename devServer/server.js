const fastify = require('fastify')({
  logger: true,
  bodyLimit: 50 * 1024 * 1024, // payload limit => 50MB
  ignoreTrailingSlash: true,
});
const {startServer, createConfiguration} = require('snowpack');
const httpProxy = require('http-proxy');

/**
 * Port settings
 */
const config = {
  backend_port: 5088,
  frontend_port: 5080,
};

// proxy server to backend api
const backend_proxy = httpProxy.createServer({target: `http://127.0.0.1:${config.backend_port}`});

(async () => {
  /**
   * MoneDB API /api/monedb/*
   */
  fastify.register(require('./api_monedb'), {prefix: '/api/monedb'});

  /**
   * Frontend server: Snowpack Dev Server
   * - source dir: ${__dirname}/../frontend/src/ => /*
   * - static dir: ${__dirname}/../frontend/assets/ => /*
   */
   const frontendServer = await startServer({
     config: createConfiguration({
       mount: {
         [`${__dirname}/../frontend/src`]: {url: '/', static: false},
         [`${__dirname}/../frontend/assets`]: {url: '/', static: true},
       },
       devOptions: {
         port: config.frontend_port,
       },
       routes: [
         {
           src: '/api/.*',
           dest: (req, res) => backend_proxy.web(req, res),
         },
       ]
     }),
   });

  // launch server
  fastify.listen(config.backend_port, () => {
    console.log(`Backend server listening on: http://localhost:${config.backend_port}/`);
    console.log(`Frontend server listening on: http://localhost:${frontendServer.port}/`);
  });
})();