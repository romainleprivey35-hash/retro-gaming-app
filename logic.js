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

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalStats();
    
    // On rend les boutons du menu cliquables
    document.querySelectorAll('section button').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.closest('section');
            // On récupère le nom de la marque (NINTENDO, PLAYSTATION ou XBOX)
            const brandName = section.querySelector('.text-white.font-bold, .uppercase').innerText;
            showCategories(brandName);
        });
    });
});

function showCategories(brand) {
    const content = document.getElementById('app-content');
    const colorClass = brand.includes('NINTENDO') ? 'glow-nintendo' : (brand.includes('XBOX') ? 'glow-xbox' : 'glow-playstation');
    const gradient = brand.includes('NINTENDO') ? 'from-red-600/20' : (brand.includes('XBOX') ? 'from-green-600/20' : 'from-blue-600/20');

    content.innerHTML = `
        <button onclick="window.location.reload()" class="mb-6 flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined">arrow_back</span> Retour au menu
        </button>
        
        <h2 class="text-2xl font-bold mb-8 uppercase tracking-tighter">${brand}</h2>

        <div class="space-y-4">
            <div class="glass-card rounded-xl overflow-hidden ${colorClass} p-6 bg-gradient-to-r ${gradient} to-transparent cursor-pointer" onclick="loadList('${brand}', 'Consoles')">
                <div class="flex justify-between items-center"><span class="text-xl font-bold text-white">CONSOLES</span><span class="material-symbols-outlined text-white">chevron_right</span></div>
            </div>
            <div class="glass-card rounded-xl overflow-hidden ${colorClass} p-6 bg-gradient-to-r ${gradient} to-transparent cursor-pointer" onclick="loadList('${brand}', 'Jeux')">
                <div class="flex justify-between items-center"><span class="text-xl font-bold text-white">JEUX</span><span class="material-symbols-outlined text-white">chevron_right</span></div>
            </div>
            <div class="glass-card rounded-xl overflow-hidden ${colorClass} p-6 bg-gradient-to-r ${gradient} to-transparent cursor-pointer" onclick="loadList('${brand}', 'Accessoires')">
                <div class="flex justify-between items-center"><span class="text-xl font-bold text-white">ACCESSOIRES</span><span class="material-symbols-outlined text-white">chevron_right</span></div>
            </div>
        </div>`;
}

function loadList(brand, type) { console.log("Vers la liste :", brand, type); }
