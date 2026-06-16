// Indirizzo base del backend.
// In produzione usa la variabile d'ambiente impostata su Vercel,
// in sviluppo locale usa il default localhost:5000.
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ACCESS_TOKEN_STORAGE_KEY = 'token';

// L'access token viene salvato in localStorage: persiste anche dopo la chiusura del browser.
// Non usiamo sessionStorage perché vogliamo che l'utente resti loggato tra una sessione e l'altra.
export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function saveAccessToken(token) {
    if (token) localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

// Chiede al backend un nuovo access token usando il refresh token nel cookie.
// Il browser manda il cookie automaticamente grazie a credentials: 'include'.
// Il backend verifica il cookie, revoca il vecchio refresh token ed emette un nuovo paio.
export async function refreshAccessToken() {
    const risposta = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!risposta.ok) {
        clearAccessToken();
        return null;
    }

    const dati = await risposta.json();

    if (dati.accessToken) {
        saveAccessToken(dati.accessToken);
        return dati.accessToken;
    }

    return null;
}

// apiFetch è il nostro "fetch intelligente":
// 1. Prova la richiesta con il token corrente.
// 2. Se il server risponde 401 (token scaduto), prova a rinnovarlo automaticamente.
// 3. Se il rinnovo riesce, ripete la richiesta originale con il nuovo token.
// 4. Se il rinnovo fallisce, restituisce il 401 originale (l'utente dovrà fare login).
// In questo modo l'utente non si accorge mai della scadenza del token.
export async function apiFetch(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    const headers = options.body ? { 'Content-Type': 'application/json' } : {};

    const baseOptions = {
        method: options.method || 'GET',
        credentials: 'include',
        ...(options.body ? { body: options.body } : {}),
    };

    const primaRisposta = await fetch(url, {
        ...baseOptions,
        headers: { ...headers, Authorization: `Bearer ${getAccessToken()}` },
    });

    if (primaRisposta.status !== 401) {
        return primaRisposta;
    }

    const nuovoToken = await refreshAccessToken();

    if (!nuovoToken) {
        return primaRisposta;
    }

    return fetch(url, {
        ...baseOptions,
        headers: { ...headers, Authorization: `Bearer ${nuovoToken}` },
    });
}
