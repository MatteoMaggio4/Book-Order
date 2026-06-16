import { apiFetch} from './client';

async function requestJson(path, options = {}, fallbackMessage = 'Richiesta non riuscita') {
    // Funzione comune per tutte le chiamate sugli ordini.
    // Fa la richiesta, legge il JSON e gestisce gli errori.
    const risposta = await apiFetch(path, options);
    const dati = await risposta.json();

    if (!risposta.ok) {
        throw new Error(dati.message || fallbackMessage);
    }

    return dati;
}

export async function creaOrdine(cartItems, numeroTavolo) {
    return requestJson('/api/order', {
        method: 'POST',
        body: JSON.stringify({
            cartItems,
            numeroTavolo,
        }),
    }, 'Ordine non registrato. Riprova.');
}

export async function caricaOrdiniCliente() {
    const dati = await requestJson('/api/order');

    if (!dati.ordini) {
        return [];
    }

    return dati.ordini;
}

export async function caricaOrdiniStaff() {
    const dati = await requestJson('/api/order/staff');

    if (!dati.ordini) {
        return [];
    }

    return dati.ordini;
}

export async function aggiornaStatoOrdineStaff(ordineId, stato) {
    return requestJson(`/api/order/staff/${ordineId}/stato`, {
        method: 'PATCH',
        body: JSON.stringify({ stato }),
    }, 'Stato non aggiornato');
}
