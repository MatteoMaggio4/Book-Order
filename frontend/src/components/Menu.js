import React, { useState } from 'react';
import { Grid, Box, Button } from '@mui/material';
import { useCart } from './CartContext';
import ProdottoCard from './ProdottoCard';

// Lista statica dei prodotti del menu.
// Definita fuori dal componente perché non cambia mai:
// se fosse dentro, React la ricreerebbe ad ogni render.
const prodottiMenu = [
    { id: 1,  nome: 'Classic Burger',         categoria: 'Burger',          desc: 'Hamburger di manzo, lattuga, pomodoro, cheddar e salsa burger.',      prezzo: 7.50, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80' },
    { id: 2,  nome: 'Double Beef Burger',      categoria: 'Burger',          desc: 'Doppio hamburger di manzo, doppio cheddar, lattuga e salsa speciale.', prezzo: 9.00, img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=700&q=80' },
    { id: 3,  nome: 'BBQ Bacon Burger',        categoria: 'Burger',          desc: 'Manzo, bacon croccante, cheddar, cipolla caramellata e salsa BBQ.',   prezzo: 9.50, img: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=700&q=80' },
    { id: 4,  nome: 'Crispy Chicken Burger',   categoria: 'Burger',          desc: 'Pollo croccante, lattuga, pomodoro e maionese.',                      prezzo: 8.50, img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=700&q=80' },
    { id: 5,  nome: 'Spicy Jalapeno Burger',   categoria: 'Burger',          desc: 'Manzo, cheddar, jalapeno, insalata e salsa piccante.',                prezzo: 9.20, img: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=700&q=80' },
    { id: 6,  nome: 'Veggie Burger',           categoria: 'Burger',          desc: 'Burger vegetale, lattuga, pomodoro, cipolla e salsa yogurt.',         prezzo: 8.00, img: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=700&q=80' },
    { id: 7,  nome: 'Pulled Pork Sandwich',    categoria: 'Panini Speciali', desc: 'Maiale sfilacciato, coleslaw e salsa BBQ.',                           prezzo: 8.80, img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80' },
    { id: 8,  nome: 'Chicken Club',            categoria: 'Panini Speciali', desc: 'Pollo grigliato, bacon, lattuga, pomodoro e maionese.',               prezzo: 8.20, img: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?auto=format&fit=crop&w=700&q=80' },
    { id: 9,  nome: 'Hot Dog Deluxe',          categoria: 'Panini Speciali', desc: 'Wurstel, cheddar, cipolla croccante, ketchup e senape.',              prezzo: 6.50, img: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=700&q=80' },
    { id: 10, nome: 'Patatine Classiche',      categoria: 'Fritti',          desc: 'Patatine fritte croccanti con sale.',                                 prezzo: 3.00, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80' },
    { id: 11, nome: 'Patatine Cheddar & Bacon',categoria: 'Fritti',          desc: 'Patatine con cheddar fuso e bacon croccante.',                        prezzo: 4.50, img: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=700&q=80' },
    { id: 12, nome: 'Onion Rings',             categoria: 'Fritti',          desc: 'Anelli di cipolla fritti e croccanti.',                               prezzo: 3.80, img: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=700&q=80' },
    { id: 13, nome: 'Chicken Nuggets',         categoria: 'Fritti',          desc: 'Bocconcini di pollo croccanti con salsa a scelta.',                   prezzo: 4.50, img: 'https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=700&q=80' },
    { id: 14, nome: 'Mozzarella Sticks',       categoria: 'Fritti',          desc: 'Bastoncini di mozzarella filante impanati.',                          prezzo: 4.20, img: 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=700&q=80' },
    { id: 15, nome: 'Salsa Burger',            categoria: 'Salse',           desc: 'Salsa cremosa della casa.',                                           prezzo: 0.50, img: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=700&q=80' },
    { id: 16, nome: 'Salsa BBQ',               categoria: 'Salse',           desc: 'Salsa affumicata dolce.',                                             prezzo: 0.50, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=700&q=80' },
    { id: 17, nome: 'Salsa Piccante',          categoria: 'Salse',           desc: 'Salsa spicy per burger e fritti.',                                    prezzo: 0.50, img: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=700&q=80' },
    { id: 18, nome: 'Maionese',                categoria: 'Salse',           desc: 'Classica maionese.',                                                  prezzo: 0.30, img: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=700&q=80' },
    { id: 19, nome: 'Ketchup',                 categoria: 'Salse',           desc: 'Classico ketchup.',                                                   prezzo: 0.30, img: 'https://images.unsplash.com/photo-1633436375795-12b3b339712f?auto=format&fit=crop&w=700&q=80' },
    { id: 20, nome: 'Acqua Naturale',          categoria: 'Bevande',         desc: 'Bottiglia 50 cl.',                                                    prezzo: 1.20, img: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=700&q=80' },
    { id: 21, nome: 'Acqua Frizzante',         categoria: 'Bevande',         desc: 'Bottiglia 50 cl.',                                                    prezzo: 1.20, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80' },
    { id: 22, nome: 'Coca-Cola',               categoria: 'Bevande',         desc: 'Lattina 33 cl.',                                                      prezzo: 2.50, img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=700&q=80' },
    { id: 23, nome: 'Fanta',                   categoria: 'Bevande',         desc: 'Lattina 33 cl.',                                                      prezzo: 2.50, img: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=700&q=80' },
    { id: 24, nome: 'Sprite',                  categoria: 'Bevande',         desc: 'Lattina 33 cl.',                                                      prezzo: 2.50, img: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=700&q=80' },
    { id: 25, nome: 'Birra Artigianale',        categoria: 'Bevande',         desc: 'Bottiglia 33 cl.',                                                    prezzo: 4.50, img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=700&q=80' },
    { id: 26, nome: 'Brownie al Cioccolato',   categoria: 'Dolci',           desc: 'Brownie morbido con cioccolato fondente.',                            prezzo: 4.00, img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80' },
    { id: 27, nome: 'Cheesecake',              categoria: 'Dolci',           desc: 'Cheesecake con topping ai frutti rossi.',                             prezzo: 4.50, img: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=700&q=80' },
    { id: 28, nome: 'Milkshake Vaniglia',      categoria: 'Dolci',           desc: 'Milkshake cremoso alla vaniglia.',                                    prezzo: 4.00, img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=700&q=80' },
    { id: 29, nome: 'Milkshake Cioccolato',    categoria: 'Dolci',           desc: 'Milkshake cremoso al cioccolato.',                                    prezzo: 4.00, img: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=700&q=80' },
];

const categorie = ['Burger', 'Panini Speciali', 'Bevande', 'Fritti', 'Salse', 'Dolci'];

function Menu() {
    // useState gestisce la categoria attiva per il filtro.
    // Ogni click su un pulsante aggiorna categoriaSelezionata,
    // React ri-renderizza e prodottiMenu viene filtrato di nuovo.
    const [categoriaSelezionata, setCategoriaSelezionata] = useState('Burger');

    // useCart() legge il CartContext: addItem e decreaseItem modificano il carrello globale,
    // getQuantity legge quante unità di un prodotto sono già nel carrello.
    // Queste funzioni vengono passate come props ai componenti figli ProdottoCard.
    const { addItem, decreaseItem, getQuantity } = useCart();

    // filter crea un nuovo array con solo i prodotti della categoria selezionata.
    // Il confronto diretto funziona perché categoriaSelezionata viene sempre
    // da un click sui pulsanti, quindi è sempre una stringa identica a quella nel prodotto.
    const prodottiFiltrati = prodottiMenu.filter((p)=>{
        return p.categoria === categoriaSelezionata;
    });

    return (
        <Box sx={{
            width: '100%',
            minHeight: '100vh',
            background: '#1a1a1a',
            py: 5,
            px: { xs: 3, md: 10 },
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box',
        }}>
            {/* Pulsanti filtro categoria: .map() genera un bottone per ogni categoria
                senza ripetere il codice 6 volte. */}
            <Box sx={{
                display: { xs: 'grid', md: 'flex' },
                gap: 2,
                gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(3, 1fr)' },
            }}>
                {categorie.map((categoria) => (
                    <Button
                        key={categoria}
                        variant="outlined"
                        onClick={() => setCategoriaSelezionata(categoria)}
                        sx={{
                            width: '100%',
                            minHeight: { xs: '52px', sm: '50px' },
                            fontWeight: 'bold',
                            color: categoriaSelezionata === categoria ? '#ffffff' : '#ff8400',
                            borderColor: '#ff8400',
                            border: '0px',
                            borderRadius: { xs: '30px', md: '300px' },
                            backgroundColor: categoriaSelezionata === categoria ? '#ff8400' : 'transparent',
                            px: 4,
                            py: 1.5,
                            fontSize: { xs: '12px', sm: '12px', md: '15px' },
                            '&:hover': {
                                backgroundColor: categoriaSelezionata === categoria ? '#ff8400' : '#6e441f',
                                color: categoriaSelezionata === categoria ? '#ffffff' : '#ff8400',
                                boxShadow: '0 12px 40px rgba(255,132,0,0.2)',
                            },
                        }}
                    >
                        {categoria}
                    </Button>
                ))}
            </Box>

            {/* Griglia prodotti: per ogni prodotto filtrato creiamo un ProdottoCard.
                Menu è il padre: conosce il carrello e passa le funzioni giuste al figlio.
                ProdottoCard è il figlio: mostra i dati, chiama le funzioni quando serve. */}
            <Grid container spacing={3} sx={{
                display: 'flex',
                width: '100%',
                gap: 2,
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                pb: 2,
                pt: 6,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
            }}>
                {prodottiFiltrati.map((prodotto) => (
                    <Grid item xs={12} md={2} key={prodotto.id}>
                        <ProdottoCard
                            prodotto={prodotto}
                            quantita={getQuantity(prodotto.id)}
                            onAdd={() => addItem(prodotto)}
                            onDecrease={() => decreaseItem(prodotto.id)}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Menu;
