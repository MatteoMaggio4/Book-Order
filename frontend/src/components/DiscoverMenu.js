import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';

// Lista statica dei piatti in evidenza mostrati nella homepage.
const piatti = [
    {
        id: 1,
        nome: 'Double Beef Burger',
        categoria: 'Burger',
        desc: 'Doppio manzo, cheddar fuso, lattuga e salsa speciale.',
        prezzo: '9,00 EUR',
        img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
    },
    {
        id: 2,
        nome: 'Crispy Chicken Burger',
        categoria: 'Burger',
        desc: 'Pollo croccante, insalata, pomodoro e maionese.',
        prezzo: '8,50 EUR',
        img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=700&q=80',
    },
    {
        id: 3,
        nome: 'BBQ Bacon Burger',
        categoria: 'Burger',
        desc: 'Manzo, bacon croccante, cheddar e salsa BBQ.',
        prezzo: '9,50 EUR',
        img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=700&q=80',
    },
    {
        id: 4,
        nome: 'Veggie Burger',
        categoria: 'Burger',
        desc: 'Burger vegetale, lattuga, pomodoro e salsa yogurt.',
        prezzo: '8,00 EUR',
        img: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=700&q=80',
    },
    {
        id: 5,
        nome: 'Spicy Jalapeno Burger',
        categoria: 'Burger',
        desc: 'Manzo, jalapeno, cheddar e salsa piccante.',
        prezzo: '9,20 EUR',
        img: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=700&q=80',
    },
];

function DiscoverMenu() {

    return (
        <Box sx={{
            width: '100%',
            background: '#1a1a1a',
            py: 10,
            px: { xs: 3, md: 10 },
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
        }}>
            <Box sx={{ mb: 6, display: 'flex',  justifyContent: 'space-between', gap: 2 }}>
                <Box>
                    <Typography  sx={{ color: '#ff8400', letterSpacing: 3 }}>
                        DA NON PERDERE
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900, mt: 1, textTransform: 'uppercase' }}>
                        Scopri il Menu
                    </Typography>
                </Box>
            </Box>

            <Box  sx={{
                display: { xs: 'flex', md: 'flex' },
                gap: 2,
                overflowX: { xs: 'auto', md: 'visible' },
                scrollSnapType: { xs: 'x mandatory' },
                px: { xs: 3, md: 0 },
                mx: { xs: -3, md: 0 },
                pb: { xs: 2, md: 0 },
                pt: '6px',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
            }}>
                {/* Ogni card è un Link a /menu — cliccando su un piatto si va al menu completo */}
                {piatti.map((piatto) => (
                    <Card key={piatto.id} component={Link} to="/menu" sx={{
                        backgroundColor: '#2a2a2a',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.06)',
                        height: { xs: '380px', md: 'none' },
                        flex: { xs: '0 0 82%', sm: '0 0 calc(50% - 12px)', md: 'initial' },
                        width: { xs: '330px', sm: 'none' },
                        scrollSnapAlign: 'start',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        textDecoration: 'none',
                        transition: 'all 0.3s',
                        '&:hover': {
                            transform: 'translateY(-6px)',
                            border: '1px solid #ff8400',
                            boxShadow: '0 12px 40px rgba(255,132,0,0.2)',
                        },
                    }}>
                        <Box component="img" src={piatto.img} alt={piatto.nome} sx={{
                            width: '100%',
                            height: { xs: '150px', sm: '160px', md: '180px' },
                            objectFit: 'cover',
                            display: 'block',
                        }} />

                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ color: '#ff8400', fontSize: '11px', fontWeight: 'bold', letterSpacing: 2, mb: 1 }}>
                                {piatto.categoria.toUpperCase()}
                            </Typography>
                            <Typography sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '16px', mb: 1 }}>
                                {piatto.nome}
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', mb: 2 }}>
                                {piatto.desc}
                            </Typography>
                            <Typography sx={{ color: '#ff8400', fontWeight: 900, fontSize: '20px' }}>
                                {piatto.prezzo}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Button variant="outlined" component={Link} to="/menu" sx={{
                    color: '#ff8400',
                    borderColor: '#ff8400',
                    borderRadius: '300px',
                    px: 6,
                    py: 1.5,
                    fontSize: '16px',
                    '&:hover': { backgroundColor: '#ff8400', color: '#ffffff' },
                }}>
                    Vedi tutto il menu
                </Button>
            </Box>
        </Box>
    );
}

export default DiscoverMenu;
