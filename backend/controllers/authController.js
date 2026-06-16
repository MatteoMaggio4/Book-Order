const bcrypt = require('bcryptjs');
const Utente = require('../models/Utente');
const RefreshToken = require('../models/RefreshToken');
const tokenService = require('../services/tokenService');

// Crea un refresh token, lo salva nel database (hashato) e lo manda al browser come cookie.
// Separiamo questa logica in una funzione perché viene usata sia nel login che nel refresh.
async function issueRefreshToken(res, utente) {
    const refreshToken = tokenService.createRefreshToken();

    // Salviamo solo l'hash nel DB: il token in chiaro resta solo nel cookie del browser.
    await RefreshToken.create({
        user: utente._id,
        tokenHash: tokenService.hashRefreshToken(refreshToken),
        expiresAt: tokenService.getRefreshTokenExpiresAt(),
    });

    res.cookie(
        tokenService.REFRESH_COOKIE_NAME,
        refreshToken,
        tokenService.getRefreshCookieOptions()
    );
}

// GET /api/auth/me
// Usata dalla Navbar per capire se esiste una sessione attiva.
// req.user viene impostato dal middleware requireAuth prima che arrivi qui.
async function me(req, res) {
    return res.status(200).json({ utente: req.user });
}

// POST /api/auth/register
async function register(req, res) {
    try {
        const { name, email, password, role, staffCode } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Compila tutti i campi' });
        }

        const requestedRole = role === 'staff' ? 'staff' : 'cliente';

        // Il codice staff è un segreto condiviso solo col personale del ristorante.
        // Senza di esso non si può creare un account staff dalla registrazione pubblica.
        if (requestedRole === 'staff') {
            if (!process.env.STAFF_CODE) {
                return res.status(500).json({ message: 'Codice staff non configurato nel server' });
            }
            if (staffCode !== process.env.STAFF_CODE) {
                return res.status(403).json({ message: 'Codice staff non valido' });
            }
        }

        const utenteEsistente = await Utente.findOne({ email });
        if (utenteEsistente) {
            return res.status(400).json({ message: 'Email già registrata' });
        }

        // bcrypt.hash() è una funzione one-way: trasforma la password in un hash
        // che non può essere decifrato. Il numero 10 è il "salt rounds":
        // più è alto, più è sicuro ma più è lento. 10 è il valore standard.
        const passwordCriptata = await bcrypt.hash(password, 10);

        const nuovoUtente = await Utente.create({
            name,
            email,
            password: passwordCriptata,
            role: requestedRole,
        });

        return res.status(201).json({
            message: 'Utente registrato',
            utente: { id: nuovoUtente._id, name: nuovoUtente.name, email: nuovoUtente.email, role: nuovoUtente.role },
        });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore durante la registrazione' });
    }
}

// POST /api/auth/login
// Strategia dual-token:
//   access token (JWT, 15min) → nel JSON, salvato in localStorage dal frontend
//   refresh token (stringa casuale, 7gg) → nel cookie HttpOnly, invisibile a JavaScript
// Separare i due token migliora la sicurezza: l'access token è di breve durata
// e il refresh token non è mai accessibile dal codice JavaScript.
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Compila tutti i campi' });
        }

        const utente = await Utente.findOne({ email });
        if (!utente) {
            return res.status(400).json({ message: 'Email o password errate' });
        }

        // bcrypt.compare() ricalcola l'hash della password inserita e lo confronta
        // con quello salvato nel database, senza mai decifrare l'hash originale.
        const passwordCorretta = await bcrypt.compare(password, utente.password);
        if (!passwordCorretta) {
            return res.status(400).json({ message: 'Email o password errate' });
        }

        const accessToken = tokenService.createAccessToken(utente);
        await issueRefreshToken(res, utente);

        return res.status(200).json({
            message: 'Autenticazione effettuata',
            accessToken,
            utente: { id: utente._id, name: utente.name, email: utente.email, role: utente.role },
        });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore del server' });
    }
}

// POST /api/auth/refresh
// Rinnova l'access token usando il refresh token dal cookie.
// Usa la "token rotation": il refresh token usato viene revocato
// e ne viene emesso uno nuovo. Se un vecchio refresh token viene riusato,
// significa che qualcuno lo ha rubato → la sessione va invalidata.
async function refresh(req, res) {
    try {
        const refreshToken = tokenService.getRefreshTokenFromRequest(req);

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token mancante' });
        }

        const tokenHash = tokenService.hashRefreshToken(refreshToken);

        // Cerchiamo il token nel database tramite il suo hash.
        // revokedAt: null significa che non è stato ancora revocato.
        // .populate('user') carica i dati dell'utente collegato al token.
        const storedToken = await RefreshToken
            .findOne({ tokenHash, revokedAt: null })
            .populate('user');

        if (!storedToken || !storedToken.user) {
            return res.status(401).json({ message: 'Refresh token non valido' });
        }

        if (storedToken.expiresAt <= new Date()) {
            storedToken.revokedAt = new Date();
            await storedToken.save();
            return res.status(401).json({ message: 'Refresh token scaduto' });
        }

        // Revochiamo il token usato e ne emettiamo uno nuovo (token rotation).
        storedToken.revokedAt = new Date();
        await storedToken.save();

        const accessToken = tokenService.createAccessToken(storedToken.user);
        await issueRefreshToken(res, storedToken.user);

        return res.status(200).json({ message: 'Access token rigenerato', accessToken });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore durante il refresh della sessione' });
    }
}

// POST /api/auth/logout
// Revoca il refresh token nel database e cancella il cookie dal browser.
async function logout(req, res) {
    try {
        const refreshToken = tokenService.getRefreshTokenFromRequest(req);

        if (refreshToken) {
            await RefreshToken.findOneAndUpdate(
                { tokenHash: tokenService.hashRefreshToken(refreshToken), revokedAt: null },
                { revokedAt: new Date() }
            );
        }

        // clearCookie deve usare le stesse opzioni del cookie originale (httpOnly, secure, path)
        // altrimenti il browser non riconosce quale cookie eliminare.
        const cookieOptions = tokenService.getRefreshCookieOptions();
        res.clearCookie(tokenService.REFRESH_COOKIE_NAME, {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
            path: cookieOptions.path,
        });

        return res.status(200).json({ message: 'Logout effettuato' });
    } catch (errore) {
        return res.status(500).json({ message: 'Errore durante il logout' });
    }
}

module.exports = { me, register, login, refresh, logout };
