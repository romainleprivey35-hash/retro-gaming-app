const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// 1. Chargement des statistiques globales
async function loadGlobalStats() {
    try {
        const response = await fetch(BASE_URL + '&sheet=Jeux');
        const text = await response.text();
        const data = JSON.parse(text.substr(47).slice(0, -2));
        const rows = data.table.rows;
        
        let totalVal = 0;
        rows.forEach(r => {
            if(r.c[12] && r.c[12].v) totalVal += parseFloat(r.c[12].v);
        });

        const valElement = document.getElementById('total-value');
        const itemsElement = document.getElementById('total-items');
        
        if (valElement) valElement.innerText = Math.round(totalVal).toLocaleString() + " €";
        if (itemsElement) itemsElement.innerText = rows.length;
    } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
    }
}

// 2. La fonction qui crée l'écran des catégories (C'est elle qui manque !)
function showCategories(brand) {
    const content = document.getElementById('app-content');
    if (!content) return;

    const colorClass = brand === 'Nintendo' ? 'glow-nintendo' : (brand === 'Xbox' ? 'glow-xbox' : 'glow-playstation');
    const gradient = brand === 'Nintendo' ? 'from-red-600/20' : (brand === 'Xbox' ? 'from-green-600/20' : 'from-blue-600/20');

    content.innerHTML = `
        <button onclick="window.location.reload()" class="mb-6 flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined">arrow_back</span> Retour
        </button>
        
        <h2 class="text-3xl font-bold mb-8 uppercase tracking-tighter text-white">${brand}</h2>

        <div class="grid gap-4">
            <div onclick="alert('Chargement Consoles...')" class="glass-card rounded-2xl overflow-hidden ${colorClass} p-6 bg-gradient-to-r ${gradient} to-transparent cursor-pointer border border-white/5">
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-white uppercase italic">Consoles</span>
                    <span class="material-symbols-outlined text-white">chevron_right</span>
                </div>
            </div>

            <div onclick="alert('Chargement Jeux...')" class="glass-card rounded-2xl overflow-hidden ${colorClass} p-6 bg-gradient-to-r ${gradient} to-transparent cursor-pointer border border-white/5">
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-white uppercase italic">Jeux</span>
                    <span class="material-symbols-outlined text-white">chevron_right</span>
                </div>
            </div>

            <div onclick="alert('Chargement Accessoires...')" class="glass-card rounded-2xl overflow-hidden ${colorClass} p-6 bg-gradient-to-r ${gradient} to-transparent cursor-pointer border border-white/5">
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-white uppercase italic">Accessoires</span>
                    <span class="material-symbols-outlined text-white">chevron_right</span>
                </div>
            </div>
        </div>
    `;
}

// 3. Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', loadGlobalStats);
