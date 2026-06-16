// Funzioni di utilità condivise tra più componenti.
// Le definiamo qui per evitare di copiarle in ogni file:
// se dobbiamo cambiarle, lo facciamo in un solo posto.

// Formatta un numero come prezzo in formato europeo.
// toFixed(2) arrotonda a 2 decimali → replace sostituisce il punto con la virgola.
// Esempio: 7.5 → "7,50 EUR"
export function formatPrice(price) {
    return `${price.toFixed(2).replace('.', ',')} EUR`;
}

// Calcola il totale di un array di prodotti (cartItems).
// reduce è una funzione di ordine superiore: riceve una funzione accumulatrice
// e un valore iniziale (0), e la applica su ogni elemento dell'array.
// Ad ogni iterazione, totale cresce sommando prezzo × quantità del prodotto corrente.
export function calcolaTotale(items) {
    return items.reduce(function sommaTotale(totale, item) {
        return totale + item.prezzo * item.quantita;
    }, 0);
}

