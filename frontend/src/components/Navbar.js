import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAccessToken, getAccessToken } from '../api/client';
import { caricaUtenteCorrente, logoutUtente } from '../api/auth';

function Navbar() {
    const [utente, setUtente] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Verifica se l'utente ha una sessione attiva chiamando /api/auth/me.
    // Se il token è assente o scaduto (e il refresh fallisce), imposta utente a null.
    async function verificaSessione() {
        const token = getAccessToken();
        if (!token) {
            setUtente(null);
            return;
        }
        try {
            const utenteCorrente = await caricaUtenteCorrente();
            setUtente(utenteCorrente);
        } catch (errore) {
            clearAccessToken();
            setUtente(null);
        }
    }

    // Riesegue verificaSessione ogni volta che l'utente cambia pagina (location.pathname).
    // Questo mantiene la navbar sincronizzata: se il token scade durante la navigazione,
    // la navbar si aggiorna mostrando il pulsante di login invece del nome utente.
    useEffect(function aggiornaSessioneNavbar() {
        verificaSessione();
    }, [location.pathname]);

    // Chiama il server per invalidare il refresh token (cookie HttpOnly),
    // poi pulisce il token locale e reindirizza alla home.
    // Il try/catch gestisce il caso in cui il server sia irraggiungibile:
    // clearAccessToken() viene chiamato comunque per sloggare l'utente localmente.
    async function handleLogout() {
        try {
            await logoutUtente();
        } catch (errore) {
            console.log('Logout server non disponibile');
            clearAccessToken();
        }

        navigate('/');
        setUtente(null);
    }

    // isStaff determina quali elementi mostrare nella navbar.
    // Se l'utente non esiste, isStaff resta false.
    const isStaff = utente?.role === 'staff';

    return (
        <AppBar position="fixed" color="warning" sx={{ maxWidth: '100%', background: 'linear-gradient(135deg, #000000 0%, #1c1816 50%, #000000 100%)' }}>
            <Toolbar>
                {/* Il logo è un link alla home solo per i clienti — lo staff non può tornare alla home */}
                <Typography variant="h4" component={isStaff ? 'div' : Link} to={isStaff ? undefined : '/'} sx={{
                    flexGrow: 1,
                    fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
                    fontWeight: 900,
                    letterSpacing: 0,
                    color: '#ffffff',
                    textDecoration: 'none',
                    textShadow: '0 3px 10px rgba(0,0,0,0.45)',
                    cursor: isStaff ? 'default' : 'pointer',
                }}>
                    Book&Order
                </Typography>

                {isStaff && (
                    <Button color="inherit" component={Link} to="/staff" sx={{ fontWeight: 900 }}>
                        Staff
                    </Button>
                )}

                {!isStaff && (
                    <IconButton color="inherit" size="large" component={Link} to="/ordini">
                        <ReceiptLongIcon />
                    </IconButton>
                )}

                {!isStaff && (
                    <IconButton color="inherit" size="large" component={Link} to="/cart">
                        <ShoppingCartIcon />
                    </IconButton>
                )}

                {/* Se l'utente è loggato mostra "Esci", altrimenti l'icona per andare al login */}
                {utente ? (
                    <Button color="inherit" onClick={handleLogout}>Esci</Button>
                ) : (
                    <IconButton color="inherit" size="large" component={Link} to="/login">
                        <PersonIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;
