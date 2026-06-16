import {
    API_BASE_URL,
    apiFetch,
    clearAccessToken,
    saveAccessToken,
} from './client';

export async function loginUtente(email, password) {
    const risposta = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const dati = await risposta.json();

    if (!risposta.ok) {
        throw new Error(dati.message || 'Richiesta non riuscita');
    }

    saveAccessToken(dati.accessToken);
    return dati;
}

export async function registraUtente(name, email, password, role, staffCode) {
    const risposta = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, staffCode }),
    });

    const dati = await risposta.json();

    if (!risposta.ok) {
        throw new Error(dati.message || 'Richiesta non riuscita');
    }

    return dati;
}

// Rotta protetta: usa apiFetch che aggiunge l'header Authorization
// e sa rinnovare il token automaticamente se è scaduto.
// Usata dalla Navbar per sapere chi è l'utente loggato.
export async function caricaUtenteCorrente() {
    const risposta = await apiFetch('/api/auth/me', { method: 'GET' });
    const dati = await risposta.json();

    if (!risposta.ok) {
        throw new Error(dati.message || 'Sessione non valida');
    }

    return dati.utente;
}

// Invalida il refresh token sul server e cancella l'access token locale.
// Il try/catch garantisce che anche se il server non risponde,
// l'utente venga sloggato localmente (clearAccessToken viene chiamato nel finally).
export async function logoutUtente() {
    try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        });
    } finally {
        clearAccessToken();
    }
}
