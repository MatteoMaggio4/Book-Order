import { io } from 'socket.io-client';
import { API_BASE_URL, refreshAccessToken } from './client';

// Apre una connessione Socket.IO autenticata con il backend.
// Restituisce una funzione di disconnessione: React la chiama quando il componente
// viene smontato, evitando connessioni duplicate e memory leak.
//
// onOrderChange viene chiamata con (tipo, data) ogni volta che arriva un evento:
//   tipo = 'created' → nuovo ordine da caricare
//   tipo = 'updated' → ordine esistente da aggiornare
export function collegaRealtimeOrdini(token, onOrderChange) {
    let active = true;

    // Il token viene passato nell'oggetto auth: il backend lo legge in authenticateSocket.
    const socket = io(API_BASE_URL, {
        auth: { token },
    });

    socket.on('orderCreated',(data)=> {
        onOrderChange('created', data);
    });

    socket.on('orderUpdated', (data)=>{
        onOrderChange('updated', data);
    });

    // connect_error si verifica di solito quando l'access token è scaduto.
    // Proviamo a rinnovarlo con il refresh token e riconnettiamo il socket.
    // Il flag "active" evita di riconnettersi se il componente è già stato smontato.
    socket.on('connect_error', async ()=> {
        const nuovoToken = await refreshAccessToken();

        if (!active || !nuovoToken) return;

        socket.auth = { token: nuovoToken };
        socket.connect();
    });

    return function scollegaRealtimeOrdini() {
        active = false;
        socket.disconnect();
    };
}
