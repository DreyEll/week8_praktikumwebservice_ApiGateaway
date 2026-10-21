const express = require('express');
const app = express();
app.use(express.json());

const orders = [
  { id: 1001, eventId: 1, quantity: 2, status: 'pending' },
  { id: 1002, eventId: 2, quantity: 1, status: 'confirmed' }
];

app.get('/', (req, res) => {
  res.json({ service: 'Order Service', message: 'Order Service aktif' });
});

app.get('/orders', (req, res) => res.json({ data: orders }));

app.get('/orders/:id', (req, res) => {
  const order = orders.find(item => item.id === Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  res.json({ data: order });
});

app.post('/orders', (req, res) => {
  const { eventId, quantity } = req.body || {};
  if (!Number.isInteger(eventId) || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'eventId dan quantity harus berupa bilangan bulat; quantity minimal 1' });
  }
  const order = {
    id: Date.now(),
    eventId,
    quantity,
    status: 'pending'
  };
  orders.push(order);
  res.status(201).json({ message: 'Pesanan dibuat untuk simulasi', data: order });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Order Service berjalan di port ${port}`));