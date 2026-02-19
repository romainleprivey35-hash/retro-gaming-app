const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// 1. Chargement des stats au démarrage
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

        document.getElementById('total-value').innerText = Math.round(totalVal).toLocaleString() + " €";
        document.getElementById('total-items').innerText = rows.length;
    } catch (error) {
        console.error("Erreur stats:", error);
    }
}

// 2. LA FONCTION QUI MANQUE (Celle qui répare ton erreur)
function showCategories(brand) {
    const content = document.getElementById('app-content');
    
    // Définition du style selon la marque
    const colorClass = brand === 'Nintendo' ? 'glow-nintendo' : (brand === 'Xbox' ? 'glow-xbox' : 'glow-playstation');
    const gradient = brand === 'Nintendo' ? 'from-red-600/20' : (brand === 'Xbox' ? 'from-green-600/20' : 'from-blue-600/20');
    const borderColor = brand === 'Nintendo' ? 'border-red-500/20' : (brand === 'Xbox' ? 'border-green-500/20' : 'border-blue-500/20');

    content.innerHTML = `
        <button onclick="window.location.reload()" class="mb-6 flex items-center gap-2 text-primary font-bold">
            <span class="material-symbols-outlined">arrow_back</span> Retour
        </button>
        
        <h2 class="text-3xl font-bold mb-8 uppercase tracking-tighter text-white">${brand}</h2>

        <div class="grid gap-6">
            <div onclick="alert('Chargement Consoles...')" class="glass-card rounded-2xl overflow-hidden ${colorClass} border ${borderColor} p-8 bg-gradient-to-br ${gradient} to-transparent cursor-pointer transition-transform active:scale-95">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hardware</p>
                        <span class="text-2xl font-black text-white italic">CONSOLES</span>
                    </div>
                    <span class="material-symbols-outlined text-4xl text-white/50">chevron_right</span>
                </div>
            </div>

            <div onclick="alert('Chargement Jeux...')" class="glass-card rounded-2xl overflow-hidden ${colorClass} border ${borderColor} p-8 bg-gradient-to-br ${gradient} to-transparent cursor-pointer transition-transform active:scale-95">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Software</p>
                        <span class="text-2xl font-black text-white italic">JEUX</span>
                    </div>
                    <span class="material-symbols-outlined text-4xl text-white/50">chevron_right</span>
                </div>
            </div>

            <div onclick="alert('Chargement Accessoires...')" class="glass-card rounded-2xl overflow-hidden ${colorClass} border ${borderColor} p-8 bg-gradient-to-br ${gradient} to-transparent cursor-pointer transition-transform active:scale-95">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Extras</p>
                        <span class="text-2xl font-black text-white italic">ACCESSOIRES</span>
                    </div>
                    <span class="material-symbols-outlined text-4xl text-white/50">chevron_right</span>
                </div>
            </div>
        </div>
    `;
}

// Lancement automatique
document.addEventListener('DOMContentLoaded', loadGlobalStats);
