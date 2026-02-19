const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// Cette fonction calcule tes stats (Valeur et Objets)
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

        if (document.getElementById('total-value')) {
            document.getElementById('total-value').innerText = Math.round(totalVal).toLocaleString() + " €";
            document.getElementById('total-items').innerText = rows.length;
        }
    } catch (e) { console.error("Erreur stats:", e); }
}

// C'EST CETTE FONCTION QUI REPARE TON ERREUR
window.showCategories = function(brand) {
    const content = document.getElementById('app-content');
    
    const color = brand === 'Nintendo' ? 'glow-nintendo' : (brand === 'Xbox' ? 'glow-xbox' : 'glow-playstation');
    const grad = brand === 'Nintendo' ? 'from-red-600/20' : (brand === 'Xbox' ? 'from-green-600/20' : 'from-blue-600/20');

    content.innerHTML = `
        <button onclick="window.location.reload()" class="mb-6 flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined">arrow_back</span> Retour
        </button>
        
        <h2 class="text-3xl font-bold mb-8 uppercase text-white">${brand}</h2>

        <div class="grid gap-4">
            <div class="glass-card rounded-2xl ${color} p-6 bg-gradient-to-r ${grad} to-transparent border border-white/5 cursor-pointer">
                <div class="flex justify-between items-center text-white">
                    <span class="text-xl font-bold uppercase italic">Consoles</span>
                    <span class="material-symbols-outlined">chevron_right</span>
                </div>
            </div>
            <div class="glass-card rounded-2xl ${color} p-6 bg-gradient-to-r ${grad} to-transparent border border-white/5 cursor-pointer">
                <div class="flex justify-between items-center text-white">
                    <span class="text-xl font-bold uppercase italic">Jeux</span>
                    <span class="material-symbols-outlined">chevron_right</span>
                </div>
            </div>
        </div>`;
};

document.addEventListener('DOMContentLoaded', loadGlobalStats);
