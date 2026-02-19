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
window.showCategories = function(brand, type = 'Menu') {
    const content = document.getElementById('app-content');
    if (!content) return;

    const color = brand === 'Nintendo' ? 'glow-nintendo' : (brand === 'Xbox' ? 'glow-xbox' : 'glow-playstation');
    const grad = brand === 'Nintendo' ? 'from-red-600/20' : (brand === 'Xbox' ? 'from-green-600/20' : 'from-blue-600/20');
    const border = brand === 'Nintendo' ? 'border-red-500/20' : (brand === 'Xbox' ? 'border-green-500/20' : 'border-blue-500/20');

    // SI ON CLIQUE SUR UN BOUTON PRÉCIS (Jeux, Acc, etc.)
    if (type !== 'Menu') {
        content.innerHTML = `
            <button onclick="window.location.reload()" class="mb-6 flex items-center gap-2 text-primary font-bold transition-all hover:gap-3">
                <span class="material-symbols-outlined">arrow_back</span> RETOUR
            </button>
            <div class="mb-8">
                <h2 class="text-4xl font-black text-white uppercase italic tracking-tighter">${brand}</h2>
                <p class="text-primary font-bold tracking-widest text-sm mt-1 uppercase">${type}</p>
            </div>
            
            <div id="items-grid" class="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                <div class="col-span-2 py-20 text-center">
                    <div class="inline-block animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                    <p class="text-slate-400 font-medium italic">Chargement des ${type}...</p>
                </div>
            </div>
        `;
        // C'est ici qu'on appellera la fonction pour charger les données Sheets plus tard
        return;
    }

    // SI ON CLIQUE SUR LE GROS BLOC (Menu intermédiaire)
    content.innerHTML = `
        <button onclick="window.location.reload()" class="mb-6 flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined">arrow_back</span> RETOUR
        </button>
        
        <h2 class="text-4xl font-black mb-8 uppercase italic tracking-tighter text-white">${brand}</h2>

        <div class="grid gap-4 w-full">
            ${['Consoles', 'Jeux', 'Accessoires'].map(cat => `
                <div onclick="showCategories('${brand}', '${cat}')" class="glass-card rounded-2xl ${color} border ${border} p-6 bg-gradient-to-r ${grad} to-transparent cursor-pointer active:scale-95 transition-all group">
                    <div class="flex justify-between items-center">
                        <span class="text-xl font-black text-white uppercase italic tracking-tight">${cat}</span>
                        <span class="material-symbols-outlined text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">chevron_right</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};
document.addEventListener('DOMContentLoaded', loadGlobalStats);
