const { Ordine, statiOrdine } = require('../models/Ordine');
const realtimeService = require('../services/realtimeService');

// Invia una notifica real-time sia al cliente che ha creato l'ordine
// sia a tutti gli account staff collegati in quel momento.
// Questo garantisce che entrambi vedano l'aggiornamento senza ricaricare la pagina.
function avvisaOrdine(ordine, evento) {
    const idCliente = ordine.idUtente;

    realtimeService.emitToUser(idCliente, evento, {
        orderId: ordine._id,
        stato: ordine.stato,
    });

    realtimeService.emitToStaff(evento, {
        orderId: ordine._id,
        stato: ordine.stato,
        numeroTavolo: ordine.numeroTavolo,
    });
}

// GET /api/order
// Il cliente vede solo i propri ordini: filtriamo per idUtente.
// req.userId viene impostato da requireAuth, quindi sappiamo già chi è loggato.
// .sort({ _id: -1 }) ordina dal più recente al più vecchio (MongoDB usa _id come timestamp).
// .lean() restituisce oggetti JavaScript puri invece di documenti Mongoose: più veloce
// quando dobbiamo solo leggere i dati senza modificarli.
async function getMyOrders(req, res) {
    try {
        const ordini = await Ordine
            .find({ idUtente: req.userId })
            .sort({ _id: -1 })
            .lean();

        return res.status(200).json({ ordini });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore nel recupero degli ordini' });
    }
}

// POST /api/order
// Crea un nuovo ordine, lo salva nel database e avvisa staff e cliente via Socket.IO.
async function createOrder(req, res) {
    try {
        const { cartItems, numeroTavolo } = req.body;

        // Validazione server-side: anche se il frontend controlla già questi campi,
        // il backend deve validare indipendentemente perché le API sono pubbliche
        // e possono essere chiamate anche senza passare dal frontend.
        if (!numeroTavolo) {
            return res.status(400).json({ message: 'Inserisci un tavolo' });
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Il carrello è vuoto' });
        }

        const ordine = await Ordine.create({
            cartItems,
            idUtente: req.userId,
            numeroTavolo,
        });

        // Avvisiamo in tempo reale: il cliente vede l'ordine confermato,
        // lo staff riceve il nuovo ordine sulla schermata senza ricaricare.
        avvisaOrdine(ordine, 'orderCreated');

        return res.status(201).json({ message: 'ORDINE EFFETTUATO CON SUCCESSO', ordine });
    } catch (errore) {
        return res.status(500).json({ message: 'Ordine non registrato nel database. Riprova.' });
    }
}

// GET /api/order/staff
// Solo lo staff può vedere tutti gli ordini (requireRole('staff') lo garantisce in routes).
async function getAllOrders(req, res) {
    try {
        const ordini = await Ordine
            .find({})
            .sort({ _id: -1 })
            .lean();

        return res.status(200).json({ ordini });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore nel recupero degli ordini staff' });
    }
}

// PATCH /api/order/staff/:id/stato
// Lo staff aggiorna lo stato di un ordine (es. da "In preparazione" a "Pronto").
// Usiamo PATCH invece di PUT perché modifichiamo un solo campo, non l'intero documento.
async function updateAnyOrderStatus(req, res) {
    try {
        const { stato } = req.body;

        // statiOrdine è l'array definito nel model: ['In preparazione', 'Pronto', 'Consegnato'].
        // .includes() previene stati inventati che non corrispondono a nessun valore valido.
        if (!statiOrdine.includes(stato)) {
            return res.status(400).json({ message: 'Stato ordine non valido' });
        }

        // findByIdAndUpdate cerca l'ordine per id (dall'URL), applica l'aggiornamento
        // e con returnDocument: 'after' restituisce il documento già aggiornato.
        const ordine = await Ordine.findByIdAndUpdate(
            req.params.id,
            { stato },
            { returnDocument: 'after', runValidators: true }
        );

        if (!ordine) {
            return res.status(404).json({ message: 'Ordine non trovato' });
        }

        // Aggiornamento real-time: il cliente vede subito il nuovo stato del suo ordine.
        avvisaOrdine(ordine, 'orderUpdated');

        return res.status(200).json({ message: 'Stato ordine aggiornato', ordine });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore durante aggiornamento stato ordine staff' });
    }
}

module.exports = { getMyOrders, createOrder, getAllOrders, updateAnyOrderStatus };
