const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU';
const getUrl = (sheetName) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

let allFetchedItems = []; 

// FONCTION RÉCUPÉRÉE DE TON ANCIENNE APP
function toDirectLink(val) {
    if (!val) return "";
    const str = val.toString();
    const match = str.match(/[-\w]{25,}/); 
    return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w800` : "";
}

const findIdx = (headers, name) => headers.findIndex(h => h && h.label && h.label.trim().toLowerCase() === name.toLowerCase());

window.showCategories = function(brand, type = 'Menu') {
    const content = document.getElementById('app-content');
    if (!content) return;
    if (type !== 'Menu') {
        renderListLayout(brand, type);
        loadItems(brand, type);
        return;
    }
    content.innerHTML = `
        <button onclick="window.location.reload()" class="mb-6 flex items-center gap-2 text-primary font-bold"><span class="material-symbols-outlined">arrow_back</span> RETOUR</button>
        <h2 class="text-4xl font-black mb-8 uppercase italic text-white">${brand}</h2>
        <div class="grid gap-4 w-full px-2">
            ${['Consoles', 'Jeux', 'Accessoires'].map(cat => `
                <div onclick="showCategories('${brand}', '${cat}')" class="glass-card rounded-2xl p-6 bg-slate-800/50 border border-white/5 cursor-pointer active:scale-95 transition-all">
                    <div class="flex justify-between items-center text-white text-xl font-black uppercase italic">
                        <span>${cat}</span>
                        <span class="material-symbols-outlined">chevron_right</span>
                    </div>
                </div>`).join('')}
        </div>`;
};

function renderListLayout(brand, type) {
    const content = document.getElementById('app-content');
    content.innerHTML = `
        <header class="flex items-center justify-between mb-4 px-4 pt-4">
            <button onclick="window.location.reload()" class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 id="page-info" data-type="${type}" class="text-xl font-bold uppercase italic text-white">${type} ${brand}</h1>
            <div class="size-10"></div>
        </header>
        ${type !== 'Consoles' ? `
        <div id="console-filter" class="flex overflow-x-auto gap-3 py-4 no-scrollbar px-4 mb-2" style="scrollbar-width: none;">
            <button id="btn-tout" onclick="filterByConsole('TOUT', null, this)" class="filter-btn px-6 py-2 bg-primary text-white rounded-full font-bold whitespace-nowrap shadow-lg">TOUT</button>
        </div>` : ''}
        <div id="items-grid" class="grid grid-cols-2 gap-4 px-4 pb-24 text-white">
            <div class="col-span-2 text-center py-20 text-slate-500 italic animate-pulse">CHARGEMENT...</div>
        </div>
    `;
}

async function loadItems(brand, type) {
    try {
        const response = await fetch(getUrl(type)); 
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        const rows = data.table.rows;
        const headers = data.table.cols;

        const m = {
            titre: findIdx(headers, 'Titre') !== -1 ? findIdx(headers, 'Titre') : findIdx(headers, 'Nom'),
            brand: findIdx(headers, 'Constructeur'),
            photo: findIdx(headers, 'Jaquette') !== -1 ? findIdx(headers, 'Jaquette') : findIdx(headers, 'Photo'),
            format: findIdx(headers, 'Format'),
            achat: findIdx(headers, 'Achat'),
            console: findIdx(headers, 'Console') !== -1 ? findIdx(headers, 'Console') : findIdx(headers, 'Console Associée')
        };

        allFetchedItems = rows.filter(r => {
            if (!r.c || !r.c[m.brand]) return false;
            const itemBrand = r.c[m.brand].v || ''; 
            return itemBrand.toString().toLowerCase() === brand.toLowerCase();
        }).map(r => ({ ...r, colMap: m }));

        if (type !== 'Consoles' && m.console !== -1) {
            const consoles = [...new Set(allFetchedItems.map(r => (r.c[m.console] ? r.c[m.console].v : '')).filter(c => c))].sort();
            const filterBar = document.getElementById('console-filter');
            if (filterBar) {
                consoles.forEach(c => {
                    filterBar.innerHTML += `<button onclick="filterByConsole('${c}', ${m.console}, this)" class="filter-btn px-6 py-2 glass-card text-slate-400 rounded-full font-bold whitespace-nowrap border border-white/10 transition-all">${c}</button>`;
                });
            }
        }
        displayGrid(allFetchedItems);
    } catch (e) { console.error("Erreur Technique:", e); }
}

function filterByConsole(name, idx, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white');
        b.classList.add('glass-card', 'text-slate-400');
    });
    btn.classList.add('bg-primary', 'text-white');
    const filtered = name === 'TOUT' ? allFetchedItems : allFetchedItems.filter(r => r.c[idx] && r.c[idx].v == name);
    displayGrid(filtered);
}

function displayGrid(items) {
    const grid = document.getElementById('items-grid');
    if(!grid) return;
    grid.innerHTML = '';

    items.forEach(r => {
        const m = r.colMap;
        const title = (r.c[m.titre] && r.c[m.titre].v) ? r.c[m.titre].v : 'Sans Nom';
        const rawPhoto = (r.c[m.photo] && r.c[m.photo].v) ? r.c[m.photo].v : '';
        
        // UTILISATION DE LA FONCTION TO DIRECT LINK
        const imgUrl = toDirectLink(rawPhoto);

        const formatInfo = (r.c[m.format] && r.c[m.format].v) ? r.c[m.format].v : ''; 
        const achatStatus = (r.c[m.achat] && r.c[m.achat].v) ? r.c[m.achat].v : '';

        const isOwned = (achatStatus && achatStatus.toString().toLowerCase() !== 'non' && achatStatus !== '');
        
        const card = document.createElement('div');
        card.className = `flex flex-col gap-3 transition-all ${isOwned ? '' : 'opacity-25 grayscale'}`;
        
        card.innerHTML = `
            <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/5 bg-slate-800 shadow-xl">
                ${imgUrl ? `<img class="w-full h-full object-cover" src="${imgUrl}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x400/0a0a0a/333?text=Erreur+Image'">` : ''}
                ${isOwned ? '<div class="absolute top-2 right-2 bg-primary text-[8px] font-black px-2 py-1 rounded-full text-white uppercase shadow-lg">OWNED</div>' : ''}
            </div>
            <div class="px-1">
                <p class="font-bold text-[11px] leading-tight text-white line-clamp-2 uppercase italic tracking-tighter">${title}</p>
                <p class="text-primary text-[10px] font-black mt-1 uppercase italic tracking-widest">${formatInfo}</p>
            </div>`;
        grid.appendChild(card);
    });
}
