import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { getAccessToken } from '../api/client';
import { aggiornaStatoOrdineStaff, caricaOrdiniStaff } from '../api/orders';
import { collegaRealtimeOrdini } from '../api/realtime';
import OrdineCard from './OrdineCard';

function StaffOrders() {
    // ordini: tutti gli ordini del ristorante, aggiornati in real-time.
    // errore: messaggio da mostrare in caso di problema.
    // loading: true solo durante il primo caricamento.
    const [ordini, setOrdini] = useState([]);
    const [errore, setErrore] = useState('');
    const [loading, setLoading] = useState(true);

    async function caricaOrdini(mostraLoading = false) {
        if (!getAccessToken()) {
            setErrore('Devi effettuare il login come staff');
            if (mostraLoading) setLoading(false);
            return;
        }

        if (mostraLoading) setLoading(true);

        try {
            const lista = await caricaOrdiniStaff();
            setErrore('');
            setOrdini(lista);
        } catch {
            setErrore('Errore di connessione al server');
        } finally {
            if (mostraLoading) setLoading(false);
        }
    }

    // Aggiorna un singolo ordine nella lista locale senza ricaricare tutto.
    // La versione funzionale di setOrdini garantisce che lavoriamo sempre
    // sull'array più aggiornato (utile con aggiornamenti real-time rapidi).
    function aggiornaOrdineLocale(ordineId, nuovoStato) {
        setOrdini((listaCorrente)=> {
            
            return listaCorrente.map(function aggiornaOrdine(ordine) {
                if (ordine._id === ordineId) {
                    return { ...ordine, stato: nuovoStato };
                }
                return ordine;
            });
        });
    }

    // cambiaStato viene passata come prop onCambiaStato a OrdineCard.
    // Il componente figlio la chiama quando lo staff clicca un bottone stato.
    // Prima salviamo nel database, poi aggiorniamo l'interfaccia localmente.
    async function cambiaStato(ordineId, nuovoStato) {
        try {
            await aggiornaStatoOrdineStaff(ordineId, nuovoStato);
            setErrore('');
            aggiornaOrdineLocale(ordineId, nuovoStato);
        } catch (e) {
            setErrore(e.message || 'Errore durante aggiornamento stato');
        }
    }

    // useEffect con [] si esegue una sola volta al montaggio.
    // Avvia il caricamento iniziale e apre il socket real-time.
    // Il return pulisce il socket quando lo staff lascia la pagina.
    useEffect(function avviaPaginaStaff() {
        caricaOrdini(true);

        const token = getAccessToken();
        if (!token) return;

        function gestisciEventoRealtime(tipo, data) {
            if (tipo === 'updated') {
                aggiornaOrdineLocale(data.orderId, data.stato);
            } else {
                caricaOrdini();
            }
        }

        return collegaRealtimeOrdini(token, gestisciEventoRealtime);
    }, []);

    const inPreparazione = ordini.filter((o) => o.stato === 'In preparazione').length;
    const pronti = ordini.filter((o) => o.stato === 'Pronto').length;

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
                        Staff ordini
                    </Typography>
                    <Typography sx={{ color: 'rgba(0,0,0,0.68)', fontWeight: 800, mt: 1 }}>
                        {inPreparazione} in preparazione / {pronti} pronti
                    </Typography>
                </Box>

                {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}

                {errore.includes('login') && (
                    <Button component={Link} to="/login" variant="contained" sx={{ mb: 3 }}>
                        Vai al login
                    </Button>
                )}

                {loading && ordini.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#ff8400' }} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                        {ordini.length === 0 && !errore ? (
                            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px', p: 4 }}>
                                Nessun ordine in sala
                            </Typography>
                        ) : (
                            // OrdineCard riceve onCambiaStato → si capisce che è la vista staff
                            // e mostra i bottoni per cambiare lo stato dell'ordine.
                            ordini.map((ordine) => (
                                <OrdineCard
                                    key={ordine._id}
                                    ordine={ordine}
                                    onCambiaStato={cambiaStato}
                                />
                            ))
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default StaffOrders;
