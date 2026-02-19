const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// 1. Stats globales au démarrage
async function loadGlobalStats() {
    try {
        const response = await fetch(BASE_URL + '&sheet=Jeux');
        const text = await response.text();
        const data = JSON.parse(text.substr(47).slice(0, -2));
        const rows = data.table.rows;
        let totalVal = 0;
        rows.forEach(r => { if(r.c[12] && r.c[12].v) totalVal += parseFloat(r.c[12].v); });
        if (document.getElementById('total-value')) {
            document.getElementById('total-value').innerText = Math.round(totalVal).toLocaleString() + " €";
            document.getElementById('total-items').innerText = rows.length;
        }
    } catch (e) { console.error("Erreur stats:", e); }
}

// 2. La fonction de navigation (Cerveau)
window.showCategories = function(brand, type = 'Menu') {
    const content = document.getElementById('app-content');
    if (!content) return;

    if (type !== 'Menu') {
        renderListLayout(brand, type);
        loadItems(brand, type); // On lance le chargement des données
        return;
    }

    // Menu intermédiaire (le design qu'on a fait avant)
    content.innerHTML = `
        <button onclick="window.location.reload()" class="mb-6 flex items-center gap-2 text-primary font-bold"><span class="material-symbols-outlined">arrow_back</span> RETOUR</button>
        <h2 class="text-4xl font-black mb-8 uppercase italic italic text-white">${brand}</h2>
        <div class="grid gap-4 w-full">
            ${['Consoles', 'Jeux', 'Accessoires'].map(cat => `
                <div onclick="showCategories('${brand}', '${cat}')" class="glass-card rounded-2xl p-6 bg-slate-800/50 border border-white/5 cursor-pointer active:scale-95 transition-all">
                    <div class="flex justify-between items-center text-white">
                        <span class="text-xl font-black uppercase italic">${cat}</span>
                        <span class="material-symbols-outlined">chevron_right</span>
                    </div>
                </div>`).join('')}
        </div>`;
};

// 3. Préparation du design "Stitch" pour la liste
function renderListLayout(brand, type) {
    const content = document.getElementById('app-content');
    content.innerHTML = `
        <header class="flex items-center justify-between mb-6">
            <button onclick="window.location.reload()" class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 class="text-xl font-bold uppercase italic">${type} ${brand}</h1>
            <div class="size-10"></div>
        </header>
        <div id="items-grid" class="grid grid-cols-2 gap-4 pb-20">
            <div class="col-span-2 text-center py-20 animate-pulse text-slate-500 italic">Chargement de la collection...</div>
        </div>
    `;
}

// 4. CHARGEMENT RÉEL DEPUIS GOOGLE SHEETS
async function loadItems(brand, type) {
    try {
        const response = await fetch(BASE_URL + '&sheet=Jeux');
        const text = await response.text();
        const data = JSON.parse(text.substr(47).slice(0, -2));
        const rows = data.table.rows;
        const grid = document.getElementById('items-grid');
        grid.innerHTML = ''; // On vide le message de chargement

        rows.forEach(r => {
            const itemBrand = r.c[1] ? r.c[1].v : ''; // Constructeur (Col B)
            const itemType = r.c[8] ? r.c[8].v : '';  // Format/Type (Col I - à ajuster selon ton sheet)
            const title = r.c[0] ? r.c[0].v : 'Sans titre';
            const img = r.c[9] ? r.c[9].v : ''; // Jaquette (Col J)
            const etat = r.c[10] ? r.c[10].v : ''; // État (Col K)

            // Filtrage : On ne garde que la marque et le type demandé
            if (itemBrand.toLowerCase() === brand.toLowerCase()) {
                
                // Design de la carte (Ton code Stitch adapté)
                const isOwned = etat !== 'Non possédé'; // Logique : si l'état est rempli, tu l'as
                const card = document.createElement('div');
                card.className = `flex flex-col gap-3 group ${isOwned ? '' : 'opacity-40'}`;
                
                card.innerHTML = `
                    <div class="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-white/10 bg-slate-900">
                        <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="${img}" alt="${title}">
                        ${isOwned ? '<div class="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Possédé</div>' : ''}
                    </div>
                    <div>
                        <p class="font-bold text-sm leading-tight text-white">${title}</p>
                        <p class="text-primary text-xs font-medium">${etat || 'Boutique'}</p>
                    </div>
                `;
                grid.appendChild(card);
            }
        });
    } catch (e) { console.error("Erreur chargement items:", e); }
}

document.addEventListener('DOMContentLoaded', loadGlobalStats);
