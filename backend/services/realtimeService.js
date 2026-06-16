const { Server } = require('socket.io');
const Utente = require('../models/Utente');
const tokenService = require('./tokenService');

// io viene inizializzato una sola volta in initializeRealtime()
// e poi usato da emitToUser/emitToStaff da qualsiasi controller.
let io;

// Le "stanze" (rooms) di Socket.IO permettono di inviare eventi
// solo a un sottoinsieme di client connessi.
// user:ID → stanza personale, riceve solo gli aggiornamenti dei propri ordini
// role:staff → stanza condivisa da tutto lo staff, riceve tutti gli ordini
const STAFF_ROOM = 'role:staff';

// Middleware Socket.IO: viene eseguito per ogni connessione prima di accettarla.
// Funziona come requireAuth di Express, ma per i websocket.
// Il client manda il token nell'oggetto auth: socket.handshake.auth.token.
// Se il token non è valido, next(new Error(...)) rifiuta la connessione.
async function authenticateSocket(socket, next) {
    try {
        const token = socket.handshake.auth?.token


        if (!token) return next(new Error('Token mancante'));

        const datiToken = tokenService.verifyAccessToken(token);
        const utente = await Utente.findById(datiToken.id).select('-password');

        if (!utente) return next(new Error('Utente non trovato'));

        // Salviamo i dati dell'utente sul socket per usarli in joinRealtimeRooms.
        socket.user = utente;
        socket.userId = utente._id.toString();

        return next();
    } catch (errore) {
        return next(new Error('Token non valido o scaduto'));
    }
}

// Dopo l'autenticazione, il client entra nelle stanze giuste.
// Ogni utente entra nella propria stanza personale.
// Lo staff entra anche nella stanza condivisa dello staff.
function joinRealtimeRooms(socket) {
    socket.join(`user:${socket.userId}`);

    if (socket.user.role === 'staff') {
        socket.join(STAFF_ROOM);
    }
}

// Inizializza Socket.IO agganciandolo al server HTTP esistente.
// Socket.IO deve condividere la porta con Express: per questo creiamo
// il server con http.createServer(app) in server.js invece di usare app.listen().
// Le regole CORS sono le stesse di Express per coerenza.
function initializeRealtime(server, corsOptions) {
    io = new Server(server, { cors: corsOptions });

    io.use(authenticateSocket);
    io.on('connection', joinRealtimeRooms);

    return io;
}

// Manda un evento a un singolo utente tramite la sua stanza personale.
// Usato per notificare il cliente che il proprio ordine è cambiato.
function emitToUser(userId, event, payload) {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, payload);
}

// Manda un evento a tutti gli account staff connessi.
// Usato per notificare lo staff di un nuovo ordine o di un aggiornamento.
function emitToStaff(event, payload) {
    if (!io) return;
    io.to(STAFF_ROOM).emit(event, payload);
}

module.exports = { initializeRealtime, emitToUser, emitToStaff };
