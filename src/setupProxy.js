const { createProxyMiddleware } = require('http-proxy-middleware');

const backendOrigin = (process.env.BACKEND_URL || 'http://localhost:8080').trim();

module.exports = function setupProxy(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: backendOrigin,
            changeOrigin: true,
        })
    );
};
