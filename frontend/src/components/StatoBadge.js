import React from 'react';
import { Typography } from '@mui/material';

// Mappa ogni stato al colore di sfondo e al colore del testo.
// Definita fuori dal componente perché non cambia mai:
// se fosse dentro, React la ricreerebbe ad ogni render inutilmente.
const coloriStato = {
    'In preparazione': { backgroundColor: '#ff8400', color: '#111' },
    'Pronto':          { backgroundColor: '#2e7d32', color: '#fff' },
    'Consegnato':      { backgroundColor: '#6a1b9a', color: '#fff' },
};

// StatoBadge è un componente presentazionale puro:
// non ha stato proprio (nessun useState), riceve solo la prop "stato"
// e restituisce il badge colorato corrispondente.
// È riusabile in Ordini (vista cliente) e StaffOrders (vista staff):
// stessa logica, stesso aspetto, zero duplicazione di codice.
function StatoBadge({ stato }) {
    // Se lo stato non è tra quelli conosciuti, usiamo un grigio neutro.
    const colori = coloriStato[stato];

    return (
        <Typography sx={{
            ...colori,
            fontWeight: 900,
            fontSize: '12px',
            borderRadius: '100px',
            px: 2,
            py: 0.6,
            letterSpacing: 0.4,
            display: 'inline-block',
            alignSelf: 'flex-start',
            fontFamily: '"Segoe UI Black", "Arial Black", sans-serif',
        }}>
            {stato}
        </Typography>
    );
}

export default StatoBadge;
