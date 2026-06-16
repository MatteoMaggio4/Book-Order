// server.js e' il punto di ingresso del backend.
// Qui configuriamo Express, CORS, Socket.IO, le rotte e MongoDB.

const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Carica le variabili del file backend/.env dentro process.env.
// Esempi: MONGO_URI, JWT_SECRET, FRONTEND_URL, STAFF_CODE.
dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const { initializeRealtime } = require('./services/realtimeService');

const app = express();

// Socket.IO deve agganciarsi a un vero server HTTP.
// Per questo creiamo server con http.createServer(app), invece di usare solo app.listen().
const server = http.createServer(app);

const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origine non consentita da CORS'));
  },
  credentials: true,
};

// Socket.IO usa lo stesso server HTTP e le stesse regole CORS di Express.
initializeRealtime(server, corsOptions);

// Middleware globali: vengono eseguiti prima delle rotte.
app.use(cors(corsOptions));
app.use(express.json());

// Rotta semplice per verificare che il server risponda.
app.get('/', function home(req, res) {
  res.send('Ciao! Il motore di Book&Order e acceso e funzionante!');
});

// Rotta tecnica utile per Render/Vercel o per test manuali.
app.get('/api/health', function health(req, res) {
  res.status(200).json({
    status: 'ok',
    service: 'book-order-backend',
  });
});

// Montiamo i router.
// Le rotte auth diventano /api/auth/login, /api/auth/register, ecc.
// Le rotte order diventano /api/order, /api/order/staff, ecc.
app.use('/api/auth', authRoutes);
app.use('/api/order', orderRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(function onDatabaseConnected() {
    console.log('Connesso al database MongoDB con successo!');
  })
  .catch(function onDatabaseError(errore) {
    console.log('Errore di connessione al database:', errore);
  });

const PORT = process.env.PORT || 5000;

server.listen(PORT, function onServerStarted() {
  console.log(`Server partito con successo! Ascolto sulla porta ${PORT}`);
});
