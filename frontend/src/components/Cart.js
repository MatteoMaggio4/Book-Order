import React, { useState } from 'react';
import '../Cart.css';
import { Box, Typography, Card, CardContent, Button, Alert, TextField, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { getAccessToken } from '../api/client';
import { creaOrdine } from '../api/orders';
import { calcolaTotale, formatPrice } from '../utils';
import CartItem from './CartItem';

// Array dei tavoli disponibili: definito fuori dal componente perché non cambia mai.
const tavoli = ['1', '2', '3', '4', '5', '6'];

function Cart() {
    // useCart() legge i dati dal CartContext (stato globale del carrello).
    // Questi dati arrivano tramite il Context — non sono props dirette.
    const { cartItems, addItem, decreaseItem, totalQuantity, clearCart } = useCart();

    // subtotal è il totale del carrello, ricalcolato ad ogni render quando cartItems cambia.
    const subtotal = calcolaTotale(cartItems);

    // Stato locale: serve solo a questo componente, non ha senso metterlo nel Context globale.
    const [errore, setErrore] = useState('');
    const [successo, setSuccesso] = useState('');
    const [numeroTavolo, setNumeroTavolo] = useState('');

    async function handleOrder() {
        setErrore('');
        setSuccesso('');

        // Validazione lato client: feedback immediato senza aspettare il server.
        if (!numeroTavolo) {
            setErrore('Seleziona il tavolo');
            setTimeout(() => setErrore(''), 3000);
            return;
        }

        if (!getAccessToken()) {
            setErrore('Devi effettuare il login prima di ordinare');
            setTimeout(() => setErrore(''), 3000);
            return;
        }
        

        try {
            const dati = await creaOrdine(cartItems, numeroTavolo);
            clearCart();
            setSuccesso(dati.message || 'ORDINE EFFETTUATO CON SUCCESSO');
        } catch (e) {
            setErrore(e.message || 'Ordine non registrato. Controlla la connessione e riprova.');
            setTimeout(() => setErrore(''), 3000);
        }
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ff6200 0%, #835b27 50%, #2d2825 100%)',
            px: { xs: 2, md: 8 },
            py: { xs: 4, md: 7 },
            color: '#ffffff',
        }}>
            <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: { xs: '32px', md: '44px' }, lineHeight: 1 }}>
                        Il tuo carrello
                    </Typography>
                    {/* Ternario per il plurale */}
                    <Typography sx={{ color: 'rgba(0,0,0,0.66)', fontSize: { xs: '14px', md: '16px' }, mt: 1 }}>
                        {totalQuantity} {totalQuantity === 1 ? 'prodotto selezionato' : 'prodotti selezionati'}
                    </Typography>
                </Box>

                {errore && <Alert severity="error" sx={{ mb: 3 }}>{errore}</Alert>}
                {successo && <Alert severity="success" sx={{ mb: 3 }}>{successo}</Alert>}

                {/* Rendering condizionale: carrello vuoto → messaggio, altrimenti → layout prodotti */}
                {cartItems.length === 0 ? (
                    <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)' }}>
                        <CardContent sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 2, p: { xs: 3, md: 5 } }}>
                            <Typography sx={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>Il carrello è vuoto</Typography>
                            <Typography sx={{ maxWidth: 420, color: 'rgba(255,255,255,0.62)' }}>
                                Scegli qualcosa dal menu e lo troverai qui pronto per l'ordine.
                            </Typography>
                            <Button component={Link} to="/menu" variant="contained" sx={{ mt: 1, backgroundColor: '#ff8400', color: '#111', fontWeight: 900, borderRadius: '12px', px: 4, py: 1.2, '&:hover': { backgroundColor: '#ff9d2e' } }}>
                                Vai al menu
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' }, gap: 3, alignItems: 'start' }}>

                        {/* Lista prodotti con selezione tavolo */}
                        <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {/* TextField controllato: value e onChange lavorano insieme.
                                        value={numeroTavolo} lega il valore mostrato allo stato React.
                                        onChange aggiorna lo stato ad ogni selezione.
                                        Senza onChange React blocca le modifiche agli input con value. */}
                                    <TextField
                                        value={numeroTavolo}
                                        onChange={(e) => setNumeroTavolo(e.target.value)}
                                        className="numero-tavolo"
                                        select
                                        label="Numero tavolo"
                                        variant="standard"
                                        sx={{
                                            p: 2,
                                            background: '#00000069',
                                            borderRadius: 5,
                                            border: '2px solid #ff7300',
                                        }}
                                    >
                                        {/* .map() sull'array tavoli per creare i MenuItem senza ripetere il codice 6 volte */}
                                        {tavoli.map((n) => (
                                            <MenuItem key={n} value={n}>Tavolo {n}</MenuItem>
                                        ))}
                                    </TextField>

                                    {/* Per ogni prodotto nel carrello, CartItem è il componente figlio.
                                        Cart è il padre: passa l'item e le funzioni di modifica.
                                        CartItem mostra i dati e chiama le funzioni al click. */}
                                    {cartItems.map((item) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            onAdd={() => addItem(item)}
                                            onDecrease={() => decreaseItem(item.id)}
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Riepilogo ordine: position sticky lo tiene visibile durante lo scroll */}
                        <Card sx={{ backgroundColor: '#242424', borderRadius: '18px', border: '1px solid rgba(255,132,0,0.24)', position: { md: 'sticky' }, top: { md: 96 } }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '24px', mb: 2 }}>Riepilogo</Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>Subtotale</Typography>
                                    <Typography sx={{ fontWeight: 800, color: '#fff' }}>{formatPrice(subtotal)}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)' }}>Servizio</Typography>
                                    <Typography sx={{ fontWeight: 800, color: '#fff' }}>{formatPrice(0)}</Typography>
                                </Box>

                                <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '20px', color: '#fff' }}>Totale</Typography>
                                    <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: '24px' }}>{formatPrice(subtotal)}</Typography>
                                </Box>

                                {/* onClick={handleOrder} senza (): passa il riferimento alla funzione,
                                    non il risultato. React chiamerà handleOrder() al click. */}
                                <Button fullWidth variant="contained" onClick={handleOrder} sx={{ backgroundColor: '#ff8400', color: '#111', fontWeight: 900, borderRadius: '12px', py: 1.4, '&:hover': { backgroundColor: '#ff9d2e' } }}>
                                    Conferma ordine
                                </Button>

                                <Button component={Link} to="/menu" fullWidth sx={{ mt: 1, color: '#ff8400', fontWeight: 800 }}>
                                    Continua ad aggiungere
                                </Button>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default Cart;
