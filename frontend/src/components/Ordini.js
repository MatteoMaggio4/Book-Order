import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../api/client';
import { caricaOrdiniCliente } from '../api/orders';
import { collegaRealtimeOrdini } from '../api/realtime';
import OrdineCard from './OrdineCard';
import { formatPrice, calcolaTotale } from '../utils';

function Ordini() {
    // ordini: array degli ordini del cliente, caricato dal backend.
    // errore: messaggio da mostrare in caso di problema.
    // loading: true solo durante il primo caricamento, serve per il CircularProgress.
    const [ordini, setOrdini] = useState([]);
    const [errore, setErrore] = useState('');
    const [loading, setLoading] = useState(true);

    // caricaOrdini recupera gli ordini dal server.
    // mostraLoading=true viene passato solo al primo caricamento:
    // negli aggiornamenti real-time successivi non vogliamo far sparire le card.
    async function caricaOrdini(mostraLoading = false) {
        if (!getAccessToken()) {
            setErrore('Devi effettuare il login per vedere i tuoi ordini');
            setOrdini([]);
            if (mostraLoading) setLoading(false);
            return;
        }

        if (mostraLoading) setLoading(true);

        try {
            const lista = await caricaOrdiniCliente();
            setErrore('');
            setOrdini(lista);
        } catch (e) {
            setErrore(e.message || 'Errore di connessione al server');
        } finally {
            if (mostraLoading) setLoading(false);
        }
    }

    // Aggiorna un singolo ordine nella lista locale senza ricaricare tutto dal server.
    // Usiamo la versione funzionale di setOrdini (con callback) per lavorare sempre
    // sull'array più aggiornato, evitando il problema del "stale closure".
    function aggiornaOrdineLocale(ordineId, nuovoStato) {
        setOrdini((listaCorrente) => {
            return listaCorrente.map((ordine) => {
                if (ordine._id === ordineId) {
                    return { ...ordine, stato: nuovoStato };
                }
                return ordine;
            });
        });
    }

    // useEffect viene eseguito una sola volta al montaggio del componente ([] come dipendenza).
    // Carica gli ordini iniziali e apre la connessione Socket.IO.
    // La funzione di cleanup (return) viene chiamata da React quando il componente
    // viene smontato (es. l'utente cambia pagina): chiude il socket per evitare
    // connessioni duplicate o memory leak.
    useEffect(function avviaPaginaOrdini() {
        caricaOrdini(true);

        const token = getAccessToken();
        if (!token) return;

        // gestisciEventoRealtime viene chiamata dal socket ogni volta che arriva un evento.
        // Se l'ordine è già nella lista lo aggiorniamo localmente (più veloce),
        // altrimenti ricarichiamo tutto (es. nuovo ordine creato).
        function gestisciEventoRealtime(tipo, data) {
            if (tipo === 'updated') {
                aggiornaOrdineLocale(data.orderId, data.stato);
            } 
        }

        // collegaRealtimeOrdini restituisce la funzione di disconnessione:
        // React la chiama automaticamente quando il componente viene smontato.
        return collegaRealtimeOrdini(token, gestisciEventoRealtime);
    }, []);

    // Aggiungiamo a ogni ordine un numero progressivo (1, 2, 3...) calcolato
    // dalla posizione nell'array. Gli ordini arrivano dal più recente, quindi
    // l'ordine più recente ha il numero più alto.
    const ordiniConNumero = ordini.map((ordine, index) =>{
        return { ...ordine, numeroOrdine: ordini.length - index };

    });

    const ordiniInPreparazione = ordiniConNumero.filter((o)=>{
        return o.stato === 'In preparazione';
    });

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            px: { xs: 2, md: 8 },
            py: { xs: 4, md: 7 },
        }}>
            <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: { xs: '32px', md: '44px' }, lineHeight: 1 }}>
                        I tuoi ordini
                    </Typography>
                    <Typography sx={{ color: 'rgba(0,0,0,0.66)', fontSize: { xs: '14px', md: '16px' }, mt: 1 }}>
                        {ordiniInPreparazione.length} in preparazione
                    </Typography>
                </Box>

                {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}

                {errore.includes('login') && (
                    <Button component={Link} to="/login" variant="contained" sx={{
                        mb: 3, backgroundColor: '#ff8400', color: '#111', fontWeight: 900,
                        borderRadius: '12px', px: 4, py: 1.2, '&:hover': { backgroundColor: '#ff9d2e' },
                    }}>
                        Vai al login
                    </Button>
                )}

                {/* Rendering condizionale: spinner durante il caricamento iniziale,
                    contenuto reale quando i dati sono pronti. */}
                {loading && ordini.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#ff8400' }} />
                    </Box>
                ) : (!errore || ordini.length > 0) && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '340px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>

                        {/* Pannello laterale: riepilogo ordini in preparazione */}
                        <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px', mb: 2 }}>
                                    In preparazione
                                </Typography>
                                {ordiniInPreparazione.length === 0 ? (
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>
                                        Nessun ordine in preparazione
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {ordiniInPreparazione.map((ordine) => (
                                            <Box key={ordine._id} sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#1d1d1d', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <Typography sx={{ color: '#fff', fontWeight: 900 }}>Ordine #{ordine.numeroOrdine}</Typography>
                                                <Typography sx={{ color: '#ff8400', fontWeight: 900, mt: 0.5 }}>{formatPrice(calcolaTotale(ordine.cartItems))}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Lista ordini: OrdineCard riceve l'ordine e il numero ma NON onCambiaStato,
                            quindi mostra la vista cliente (senza bottoni stato). */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {ordini.length === 0 ? (
                                <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
                                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px' }}>
                                            Nessun ordine trovato
                                        </Typography>
                                        <Button component={Link} to="/menu" variant="contained" sx={{
                                            mt: 2, backgroundColor: '#ff8400', color: '#111', fontWeight: 900,
                                            borderRadius: '12px', '&:hover': { backgroundColor: '#ff9d2e' },
                                        }}>
                                            Vai al menu
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                ordiniConNumero.map((ordine) => (
                                    <OrdineCard
                                        key={ordine._id}
                                        ordine={ordine}
                                        numeroOrdine={ordine.numeroOrdine}
                                    />
                                ))
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Ordini;
