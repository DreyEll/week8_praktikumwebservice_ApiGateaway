// API Gateway: satu pintu masuk (port 3000) untuk dua service music-api:
//   GraphQL (HTTP) : /graphql      -> http://127.0.0.1:8080/graphql   (reverse proxy)
//   gRPC           : /grpc/lagu/:id -> localhost:50051 LaguService.GetLagu (REST -> gRPC)
// Rate limiting diterapkan di gateway sebelum request diteruskan.
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PORT = process.env.PORT || 3000;
const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://127.0.0.1:8080';
const GRPC_ADDR = process.env.GRPC_ADDR || '127.0.0.1:50051';
const LIMIT = parseInt(process.env.RATE_LIMIT_MAX || '5', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

// --- gRPC client (dari lagu.proto milik music-api) ---
const def = protoLoader.loadSync(path.join(__dirname, 'proto', 'lagu.proto'), {
  keepCase: true, longs: String, defaults: true,
});
const music = grpc.loadPackageDefinition(def).music;
const laguClient = new music.LaguService(GRPC_ADDR, grpc.credentials.createInsecure());

const app = express();

app.use(rateLimit({
  windowMs: WINDOW_MS,
  limit: LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Batas ${LIMIT} request per ${WINDOW_MS / 1000} detik terlampaui. Coba lagi nanti.`,
    }),
}));

app.get('/health', (req, res) => res.json({ status: 'ok', gateway: true }));

// Service 1: GraphQL (path tetap /graphql)
app.use('/graphql', createProxyMiddleware({
  target: GRAPHQL_URL,
  changeOrigin: true,
  pathRewrite: (p, req) => req.originalUrl,
}));

// Service 2: gRPC, diekspos sebagai REST: GET /grpc/lagu/1
app.get('/grpc/lagu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'id harus angka' });
  laguClient.GetLagu({ id }, (err, lagu) => {
    if (err) {
      const http = { [grpc.status.NOT_FOUND]: 404, [grpc.status.UNAVAILABLE]: 503 }[err.code] || 500;
      return res.status(http).json({ error: err.details || err.message });
    }
    res.json(lagu);
  });
});

app.use((req, res) => res.status(404).json({ error: 'Route tidak ditemukan di gateway' }));

app.listen(PORT, () => {
  console.log(`Gateway berjalan di http://localhost:${PORT}`);
  console.log(`  /graphql        -> ${GRAPHQL_URL}/graphql`);
  console.log(`  /grpc/lagu/:id  -> gRPC ${GRPC_ADDR}`);
  console.log(`  Rate limit: ${LIMIT} request / ${WINDOW_MS / 1000} detik per IP`);
});