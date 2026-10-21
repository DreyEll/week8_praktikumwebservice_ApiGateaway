const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimit } = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

app.use(rateLimit({
  windowMs: 10 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak request. Coba lagi dalam beberapa saat.' }
}));

const requireApiKey = (req, res, next) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || req.get('X-API-Key') !== apiKey) {
    return res.status(401).json({ error: 'Unauthorized: API key tidak valid atau tidak ada' });
  }
  next();
};

app.use('/events', createProxyMiddleware({
  target: process.env.EVENT_SERVICE_URL || 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: { '^/events': '' }
}));

app.use('/orders', requireApiKey, createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/orders': '' }
}));

app.use((req, res) => res.status(404).json({ error: 'Route tidak ditemukan di gateway' }));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API Gateway berjalan di http://localhost:${port}`);
  console.log('Event Service: /events/*');
  console.log('Order Service: /orders/* (memerlukan X-API-Key)');
});