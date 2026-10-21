const express = require('express');
const app = express();
app.use(express.json());

const events = [
  { id: 1, name: 'Surabaya Music Fest', artist: 'Lineup diumumkan segera', location: 'Surabaya', price: 150000, availableTickets: 120 },
  { id: 2, name: 'Indie Night', artist: 'Band indie pilihan', location: 'Surabaya', price: 100000, availableTickets: 75 },
  { id: 3, name: 'Campus Concert', artist: 'Guest star', location: 'Surabaya', price: 75000, availableTickets: 200 }
];

app.get('/', (req, res) => {
  res.json({ service: 'Event Service', message: 'Event Service aktif' });
});

app.get('/events', (req, res) => res.json({ data: events }));

app.get('/events/:id', (req, res) => {
  const event = events.find(item => item.id === Number(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event tidak ditemukan' });
  res.json({ data: event });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Event Service berjalan di port ${port}`));