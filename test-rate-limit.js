(async () => {
  for (let i = 1; i <= 30; i++) {
    try {
      const res = await fetch('http://localhost:8080/events/');
      console.log(`Request ${i}: ${res.status}`);
    } catch (error) {
      console.error('Gagal terhubung. Pastikan Event Service dan API Gateway sedang berjalan.');
      process.exitCode = 1;
      break;
    }
  }
})();