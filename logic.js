const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU';
// On cible l'onglet "Jeux" pour les stats globales
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Jeux`;

async function loadGlobalStats() {
    try {
        const response = await fetch(BASE_URL);
        const text = await response.text();
        const data = JSON.parse(text.substr(47).slice(0, -2));
        const rows = data.table.rows;

        let totalValue = 0;
        let count = 0;

        rows.forEach(row => {
            // Index 12 = Colonne M (Cote Actuelle)
            // On vérifie que la cellule existe et contient une valeur
            if (row.c && row.c[12] && row.c[12].v) {
                totalValue += parseFloat(row.c[12].v);
            }
            count++;
        });

        // Mise à jour de l'affichage avec tes vraies données
        const valElem = document.getElementById('total-value');
        const countElem = document.getElementById('total-items');

        if(valElem) valElem.innerText = `${Math.round(totalValue).toLocaleString()} €`;
        if(countElem) countElem.innerText = count.toLocaleString();

    } catch (e) {
        console.error("Erreur lors de la récupération des données :", e);
    }
}

document.addEventListener('DOMContentLoaded', loadGlobalStats);
