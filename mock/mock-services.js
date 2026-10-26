// Tiruan music-api HANYA untuk uji tanpa database. Tidak dipakai saat music-api asli jalan.
const http = require('http'), path = require('path');
const grpc = require('@grpc/grpc-js'), pl = require('@grpc/proto-loader');
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ data: { lagu: [{ id: 1, judul: 'Mock Lagu' }] }, via: 'mock graphql', path: req.url }));
}).listen(8080);
const m = grpc.loadPackageDefinition(pl.loadSync(path.join(__dirname, '..', 'proto', 'lagu.proto'), { keepCase: true })).music;
const s = new grpc.Server();
s.addService(m.LaguService.service, {
  GetLagu: (c, cb) => c.request.id === 1 ? cb(null, { id: 1, judul: 'Mock Lagu', album_id: 1 })
    : cb({ code: grpc.status.NOT_FOUND, details: 'Lagu tidak ditemukan' }),
});
s.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => console.log('mock graphql :8080, mock grpc :50051'));
