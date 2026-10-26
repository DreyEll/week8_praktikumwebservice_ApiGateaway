// Mengirim request berurutan ke gateway; harus tampil status normal (200) lalu 429.
const BASE = process.env.GATEWAY_URL || 'http://localhost:3000';
const PATH = process.env.TEST_PATH || "/grpc/lagu/1";
const TOTAL = parseInt(process.env.TOTAL || '8', 10);

(async () => {
  console.log(`Uji rate limiting: GET ${BASE}${PATH} sebanyak ${TOTAL}x\n`);
  for (let i = 1; i <= TOTAL; i++) {
    const r = await fetch(BASE + PATH);
    const note = r.status === 429 ? '  <-- diblokir rate limiter' : '';
    console.log(`Request ${String(i).padStart(2)}: status ${r.status}${note}`);
  }
})();
