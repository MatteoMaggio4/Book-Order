import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import StatoBadge from './StatoBadge';
import { formatPrice, calcolaTotale } from '../utils';

// Gli stati possibili di un ordine, usati per generare i bottoni nello staff.
const statiOrdine = ['In preparazione', 'Pronto', 'Consegnato'];

// OrdineCard è usata sia in Ordini (vista cliente) che in StaffOrders (vista staff).
// Il comportamento cambia in base alla prop onCambiaStato:
//
//   onCambiaStato = undefined  →  vista cliente: mostra "Ordine #N" e nessun bottone
//   onCambiaStato = funzione   →  vista staff: mostra "Tavolo N" e i bottoni stato
//
// Questo è un esempio di componente riutilizzabile con comportamento variabile:
// invece di duplicare il codice, passiamo una prop opzionale che attiva/disattiva
// la parte staff. Il rendering condizionale {condizione && <JSX>} mostra il blocco
// solo quando condizione è truthy.
function OrdineCard({ ordine, numeroOrdine, onCambiaStato }) {
    // Se il padre ha passato numeroOrdine siamo nella vista cliente,
    // altrimenti siamo nella vista staff.
    const isStaff = onCambiaStato !== undefined;

    return (
        <Card sx={{
            backgroundColor: '#242424',
            borderRadius: '18px',
            border: '1px solid rgba(255,132,0,0.24)',
        }}>
            <CardContent sx={{ p: 3 }}>

                {/* Intestazione: titolo a sinistra, badge stato a destra */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                    <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>
                            {isStaff ? `Tavolo ${ordine.numeroTavolo}` : `Ordine #${numeroOrdine}`}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', mt: 0.5 }}>
                            {isStaff
                                ? `ID: ${ordine._id}`
                                : `${ordine.cartItems.length} ${ordine.cartItems.length === 1 ? 'prodotto' : 'prodotti'}`}
                        </Typography>
                    </Box>

                    {/* StatoBadge è un componente figlio: riceve lo stato e lo visualizza colorato */}
                    <StatoBadge stato={ordine.stato} />
                </Box>

                <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                {/* Lista prodotti: .map() trasforma ogni elemento dell'array in un elemento JSX.
                    key={...} è obbligatorio: React lo usa per identificare quale riga
                    aggiornare senza ridisegnare tutta la lista. */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {ordine.cartItems.map((item) => (
                        <Box
                            key={`${ordine._id}-${item.id}`}
                            sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 2, alignItems: 'center' }}
                        >
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ color: '#fff', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.nome}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>
                                    {item.quantita} x {formatPrice(item.prezzo)}
                                </Typography>
                            </Box>
                            <Typography sx={{ color: '#ff8400', fontWeight: 900 }}>
                                {formatPrice(item.prezzo * item.quantita)}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: isStaff ? 2 : 0 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 900 }}>Totale</Typography>
                    <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: '20px' }}>
                        {formatPrice(calcolaTotale(ordine.cartItems))}
                    </Typography>
                </Box>

                {/* Bottoni stato: visibili solo nello staff (quando onCambiaStato è definita).
                    Il bottone dello stato attuale appare "filled" (contained),
                    gli altri appaiono come outline. */}
                {isStaff && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {statiOrdine.map((stato) => (
                            <Button
                                key={stato}
                                variant={ordine.stato === stato ? 'contained' : 'outlined'}
                                onClick={() => onCambiaStato(ordine._id, stato)}
                                sx={{
                                    borderColor: '#ff8400',
                                    color: ordine.stato === stato ? '#111' : '#ff8400',
                                    backgroundColor: ordine.stato === stato ? '#ff8400' : 'transparent',
                                    fontWeight: 900,
                                    '&:hover': { backgroundColor: '#ff9d2e', color: '#111' },
                                }}
                            >
                                {stato}
                            </Button>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

export default OrdineCard;
