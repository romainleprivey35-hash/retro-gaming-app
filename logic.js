// Configuration de ton Google Sheets (on garde tes identifiants)
const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// Fonction pour charger les stats globales au démarrage
async function loadGlobalStats() {
    const response = await fetch(`${BASE_URL}&sheet=Jeux`);
    const text = await response.text();
    const data = JSON.parse(text.substr(47).slice(0, -2));
    const rows = data.table.rows;

    let totalValue = 0;
    let totalItems = rows.length;

    rows.forEach(row => {
        // Index 12 = Cote Actuelle (Colonne M)
        const price = parseFloat(row.c[12]?.v) || 0;
        totalValue += price;
    });

    // Mise à jour de l'affichage (Stats du haut)
    document.querySelector('.text-2xl.font-bold.tracking-tight').innerText = `${totalValue.toLocaleString()} €`;
    document.querySelectorAll('.text-2xl.font-bold.tracking-tight')[1].innerText = totalItems.toLocaleString();
}

// Fonction de navigation
function selectCategory(brand, type) {
    console.log(`Navigation vers : ${brand} > ${type}`);
    // Ici on enregistre le choix pour l'écran suivant
    localStorage.setItem('selectedBrand', brand);
    localStorage.setItem('selectedType', type);
    
    // On redirigera vers la page liste (qu'on créera juste après)
    // window.location.href = 'liste.html'; 
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalStats();
    
    // On rend les boutons cliquables
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = btn.closest('section');
            const brand = section.querySelector('.text-white.font-bold').innerText;
            const type = btn.querySelector('span:last-child').previousElementSibling.innerText;
            selectCategory(brand, type);
        });
    });
});
