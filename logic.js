// --- EFFET AIMANT CARROUSEL ---
const style = document.createElement('style');
style.textContent = `
    .snap-x { scroll-snap-type: x mandatory; }
    .snap-center { scroll-snap-align: center; -webkit-column-break-inside: avoid; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
`;
document.head.appendChild(style);
const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU';
const getUrl = (sheetName) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

let allFetchedItems = []; 

function toDirectLink(val) {
    if (!val) return "";
    const str = val.toString();
    const match = str.match(/[-\w]{25,}/); 
    return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w800` : "";
}

// --- SUPPRESSION DE LA NAV SI BESOIN ---
document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector('nav');
    if (nav) nav.remove();
});

// --- CALCUL DES STATS ---
async function getStats(brand, sheetName) {
    try {
        const response = await fetch(getUrl(sheetName));
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        const rows = data.table.rows;
        
        let bIdx = 1; 
        let aIdx = (sheetName === 'Consoles') ? 10 : 14; 

        let total = 0, owned = 0;
        rows.forEach((r) => {
            if (r.c && r.c[bIdx] && r.c[bIdx].v) {
                const itemBrand = r.c[bIdx].v.toString().trim().toLowerCase();
                if (brand === 'All' || itemBrand === brand.toLowerCase()) {
                    total++;
                    if (r.c[aIdx] && r.c[aIdx].v) {
                        const achatVal = r.c[aIdx].v.toString().trim().toLowerCase();
                        if (achatVal === 'oui' || r.c[aIdx].v === true) owned++;
                    }
                }
            }
        });
        return `${owned} / ${total}`;
    } catch (e) { return "0 / 0"; }
}

// --- AFFICHAGE DU MENU CATEGORIES ---
window.showCategories = async function(brand, type = 'Menu') {
    const content = document.getElementById('app-content');
    if (!content) return;
    
    if (type !== 'Menu' && type !== 'Stats') {
        renderListLayout(brand, type);
        loadItems(brand, type);
        return;
    }

    const bLower = brand.toLowerCase();
    const logos = {
        'Nintendo': '11g1hLkCEY-wLQgMOHuDdRcmBbq33Lkn7',
        'PlayStation': '1XzZYJwDRWiPBpW-16TGYPcTYSGRB-fC0',
        'Xbox': '1SzJdKKuHIv5M3bGNc9noed8mN60fNm9y'
    };

    if (type === 'Stats') {
        content.innerHTML = `
            <div class="fixed top-6 left-6 z-50">
                <button onclick="${brand === 'All' ? 'window.location.reload()' : `showCategories('${brand}', 'Menu')`}" class="w-12 h-12 flex items-center justify-center rounded-full glass-card text-white shadow-2xl">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
            </div>
            <div class="pt-20 px-4 space-y-6 pb-20">
                <div class="glass-card rounded-[2.5rem] p-8 text-center">
                    <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic mb-2">Valeur Estimée ${brand === 'All' ? 'Totale' : brand}</p>
                    <h2 id="stat-total-value" class="text-4xl font-black text-white italic">... €</h2>
                </div>

                <div class="grid grid-cols-2 gap-4 text-center">
                    <div class="glass-card p-6 rounded-3xl flex flex-col items-center">
                        <p class="text-[9px] text-slate-400 font-black uppercase italic mb-1">Investi</p>
                        <p id="stat-total-spent" class="text-xl font-black text-white italic">... €</p>
                    </div>
                    <div class="glass-card p-6 rounded-3xl flex flex-col items-center">
                        <p class="text-[9px] text-slate-400 font-black uppercase italic mb-1">Plus-Value</p>
                        <p id="stat-total-profit" class="text-xl font-black text-emerald-400 italic">... €</p>
                    </div>
                </div>

                <div class="glass-card rounded-[2rem] py-6 overflow-hidden">
                    <div class="flex flex-col items-center gap-2 mb-6 px-6 text-center">
                        <span class="material-symbols-outlined text-primary">emoji_events</span>
                        <p class="text-white font-black italic uppercase text-xs tracking-widest">Hall of Fame (Possédés)</p>
                    </div>
                    <div id="owned-rankings" class="flex overflow-x-auto gap-6 px-6 no-scrollbar snap-x">
                        <div class="text-center text-slate-500 italic text-[10px] py-4 w-full">Analyse...</div>
                    </div>
                </div>

                <div class="glass-card rounded-[2rem] py-6 overflow-hidden">
                    <div class="flex flex-col items-center gap-2 mb-6 px-6 text-center">
                        <span class="material-symbols-outlined text-amber-400">priority_high</span>
                        <p class="text-white font-black italic uppercase text-xs tracking-widest">Priorités d'Achat (Manquants)</p>
                    </div>
                    <div id="wishlist-rankings" class="flex overflow-x-auto gap-6 px-6 no-scrollbar snap-x">
                        <div class="text-center text-slate-500 italic text-[10px] py-4 w-full">Analyse...</div>
                    </div>
                </div>
            </div>`;
        calculateDetailedStats(brand);
        return;
    }

    content.innerHTML = `
        <div class="fixed top-6 left-6 z-50">
            <button onclick="window.location.reload()" class="w-12 h-12 flex items-center justify-center rounded-full glass-card text-white shadow-2xl">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
        <div class="pt-20 px-2">
            <div class="relative w-full rounded-[3.5rem] overflow-hidden glass-card flex flex-col items-center justify-center text-center p-8">
                <div class="h-24 w-full flex items-center justify-center mb-8">
                    <img src="https://drive.google.com/thumbnail?id=${logos[brand]}&sz=w1000" class="max-h-full object-contain">
                </div>
                <div class="flex gap-2 mb-8 w-full justify-center">
                    ${['Consoles', 'Jeux', 'Accessoires'].map(cat => `
                        <button onclick="showCategories('${brand}', '${cat}')" class="bg-white/5 border border-white/5 px-3 py-4 rounded-[2rem] flex flex-col items-center min-w-[90px] active:scale-95 transition-all">
                            <span class="text-[8px] text-slate-500 font-black uppercase mb-1 tracking-tighter">${cat === 'Accessoires' ? 'ACC.' : cat.toUpperCase()}</span>
                            <span id="count-${bLower}-${cat.toLowerCase()}" class="text-white text-[11px] font-black italic">...</span>
                        </button>
                    `).join('')}
                </div>
                <button onclick="showCategories('${brand}', 'Stats')" class="w-full py-5 bg-primary/20 border border-primary/30 rounded-[2rem] text-primary font-black uppercase italic text-xs tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined !text-lg">insights</span>
                    Analytiques
                </button>
            </div>
        </div>`;

    ['Consoles', 'Jeux', 'Accessoires'].forEach(cat => {
        getStats(brand, cat).then(res => {
            const el = document.getElementById(`count-${bLower}-${cat.toLowerCase()}`);
            if(el) el.innerText = res;
        });
    });
};

// --- LOGIQUE CALCUL STATS GLOBALES ---
async function calculateDetailedStats(brand) {
    let tValue = 0, tSpent = 0;
    let allOwnedItems = { Jeux: [], Consoles: [], Accessoires: [] };
    let allWishlistItems = { Jeux: [], Consoles: [], Accessoires: [] };
    const sheets = ['Consoles', 'Jeux', 'Accessoires'];
    
    for (const s of sheets) {
        try {
            const response = await fetch(getUrl(s));
            const text = await response.text();
            const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonString);
            const rows = data.table.rows;
            const headers = data.table.cols.map(h => h ? h.label : '');
            
            const bIdx = 1;
            const cIdx = (s === 'Consoles') ? 11 : 12; 
            const pIdx = (s === 'Consoles') ? 12 : 16; 
            const aIdx = (s === 'Consoles') ? 10 : 14;
            const photoIdx = (s === 'Jeux') ? 6 : (s === 'Consoles' ? 6 : 2);

            rows.forEach(r => {
                if (r.c && r.c[bIdx] && r.c[bIdx].v && (brand === 'All' || r.c[bIdx].v.toLowerCase() === brand.toLowerCase())) {
                    const isOwned = (r.c[aIdx] && (r.c[aIdx].v.toString().toLowerCase() === 'oui' || r.c[aIdx].v === true));
                    const cote = r.c[cIdx] ? parseFloat(r.c[cIdx].v) || 0 : 0;
                    const prix = r.c[pIdx] ? parseFloat(r.c[pIdx].v) || 0 : 0;

                    let itemObj = {
                        titre: r.c[0] ? r.c[0].v : 'Inconnu',
                        cote: cote,
                        etat: r.c[s === 'Consoles' ? 10 : 11] ? r.c[s === 'Consoles' ? 10 : 11].v : '',
                        photo: r.c[photoIdx] ? r.c[photoIdx].v : '',
                        rawData: {}
                    };
                    r.c.forEach((cell, i) => { if(headers[i]) itemObj.rawData[headers[i]] = cell ? cell.v : ''; });

                    if (isOwned) {
                        tValue += cote;
                        tSpent += prix;
                        allOwnedItems[s].push(itemObj);
                    } else {
                        allWishlistItems[s].push(itemObj);
                    }
                }
            });
        } catch (e) {}
    }
    const profit = tValue - tSpent;
    document.getElementById('stat-total-value').innerText = `${tValue.toLocaleString()} €`;
    document.getElementById('stat-total-spent').innerText = `${tSpent.toLocaleString()} €`;
    document.getElementById('stat-total-profit').innerText = `${profit > 0 ? '+' : ''}${profit.toLocaleString()} €`;

    renderRankings(allOwnedItems, allWishlistItems);
}

// --- CLASSEMENT DES MEILLEURS PRODUITS (CARROUSELS PAR CATEGORIE) ---
function renderRankings(ownedData, wishData) {
    const ownedContainer = document.getElementById('owned-rankings');
    const wishlistContainer = document.getElementById('wishlist-rankings');
    if(!ownedContainer || !wishlistContainer) return;
    
    const sortFn = (a, b) => (b.cote || 0) - (a.cote || 0);

    const generateCategorySections = (data) => {
        const cats = [
            { label: 'JEUX', key: 'Jeux', limit: 10 },
            { label: 'CONSOLES', key: 'Consoles', limit: 5 },
            { label: 'ACCESSOIRES', key: 'Accessoires', limit: 5 }
        ];

        return cats.map(cat => {
            const sortedItems = data[cat.key].sort(sortFn).slice(0, cat.limit);
            if (sortedItems.length === 0) return '';

            // Le secret est ici : flex-none + w-[85vw] + snap-center
            return `
                <div class="flex-none w-[85vw] snap-center flex flex-col h-auto">
                    <p class="text-[9px] font-black text-primary uppercase italic mb-4 tracking-[0.3em] text-center w-full">${cat.label} TOP ${sortedItems.length}</p>
                    <div class="flex flex-col gap-3">
                        ${sortedItems.map((item, idx) => {
                            const secureData = btoa(unescape(encodeURIComponent(JSON.stringify(item.rawData))));
                            return `
                            <div onclick="openProductDetail(JSON.parse(decodeURIComponent(escape(atob('${secureData}')))))" class="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 active:scale-[0.98]">
                                <div class="relative size-14 flex-none rounded-xl overflow-hidden border border-white/10 bg-black/20">
                                    <img src="${toDirectLink(item.photo)}" class="w-full h-full object-contain">
                                    <div class="absolute top-1 left-1 size-4 bg-white/20 backdrop-blur-md flex items-center justify-center text-[7px] font-black text-white rounded-full">#${idx + 1}</div>
                                </div>
                                <div class="flex-1 min-w-0 text-left">
                                    <p class="text-[10px] font-bold text-white truncate uppercase italic">${item.titre}</p>
                                    <p class="text-[10px] font-black text-primary italic">${item.cote || 0}€</p>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
        }).join('');
        // Injection du contenu
    ownedContainer.innerHTML = generateCategorySections(ownedData) || '<div class="text-slate-500 italic text-[10px] py-4 w-full text-center">Aucun produit</div>';
    wishlistContainer.innerHTML = generateCategorySections(wishData) || '<div class="text-slate-500 italic text-[10px] py-4 w-full text-center">Aucun produit</div>';

    // FORCE L'AIMANT (Ajoute ces lignes ici)
    ownedContainer.classList.add('snap-x', 'snap-mandatory');
    wishlistContainer.classList.add('snap-x', 'snap-mandatory');
}
    };

    // On force le scroll snap sur les containers ici même
    [ownedContainer, wishlistContainer].forEach(c => {
        c.style.scrollSnapType = "x mandatory";
        c.style.display = "flex";
        c.style.overflowX = "auto";
    });

    ownedContainer.innerHTML = generateCategorySections(ownedData) || '<div class="text-slate-500 italic text-[10px] py-4 w-full text-center">Aucun produit</div>';
    wishlistContainer.innerHTML = generateCategorySections(wishData) || '<div class="text-slate-500 italic text-[10px] py-4 w-full text-center">Aucun produit</div>';
}

// --- LAYOUT DE LA LISTE ---
function renderListLayout(brand, type) {
    const content = document.getElementById('app-content');
    content.innerHTML = `
        <div class="fixed top-6 left-4 z-50">
            <button onclick="window.location.reload()" class="w-12 h-12 flex items-center justify-center rounded-full glass-card text-white shadow-2xl">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
        <div class="pt-20">
            ${type !== 'Consoles' ? `
            <div id="console-filter" class="flex items-center overflow-x-auto gap-3 py-4 no-scrollbar px-4 mb-2" style="scrollbar-width: none;">
                <div class="relative flex-none">
                  <button id="btn-tout" onclick="filterByConsole('TOUT', -1, this)" class="filter-btn px-6 py-2 bg-primary text-white rounded-full font-bold whitespace-nowrap shadow-lg">TOUT</button>
                    </button>
                    <div id="sort-menu" class="hidden absolute top-full left-0 mt-2 w-48 glass-card rounded-2xl border border-white/10 py-2 z-[60] shadow-2xl backdrop-blur-xl">
                        <button onclick="applySort('cote')" class="w-full text-left px-4 py-2 text-[11px] font-bold text-white uppercase italic hover:bg-white/5">Cote Actuelle</button>
                        <button onclick="applySort('gain')" class="w-full text-left px-4 py-2 text-[11px] font-bold text-white uppercase italic hover:bg-white/5">Plus gros Gain (€)</button>
                        <button onclick="applySort('perte')" class="w-full text-left px-4 py-2 text-[11px] font-bold text-white uppercase italic hover:bg-white/5">Plus grosse Perte (€)</button>
                        <button onclick="applySort('manquants')" class="w-full text-left px-4 py-2 text-[11px] font-bold text-white uppercase italic hover:bg-white/5">Manquants</button>
                        <button onclick="applySort('evo+')" class="w-full text-left px-4 py-2 text-[11px] font-bold text-white uppercase italic hover:bg-white/5">Évolution + (12m)</button>
                        <button onclick="applySort('evo-')" class="w-full text-left px-4 py-2 text-[11px] font-bold text-white uppercase italic hover:bg-white/5">Évolution - (12m)</button>
                    </div>
                </div>
            </div>` : ''}
            <div id="items-grid" class="grid grid-cols-2 gap-4 px-4 pb-10 text-white">
                <div class="col-span-2 text-center py-20 text-slate-500 italic animate-pulse uppercase tracking-widest text-xs">Chargement Collection...</div>
            </div>
        </div>`;
}

// --- LOGIQUE DE TRI ---
window.toggleSortMenu = (e) => { e.stopPropagation(); document.getElementById('sort-menu').classList.toggle('hidden'); };
window.applySort = (criteria) => {
    document.getElementById('sort-menu').classList.add('hidden');
    let sorted = [...allFetchedItems];
    const getVal = (r, label) => { let v = r.rawData[label]; return v ? parseFloat(v.toString().replace(',','.')) || 0 : 0; };
    
    if (criteria === 'cote') sorted.sort((a,b) => getVal(b,'Cote Actuelle') - getVal(a,'Cote Actuelle'));
    else if (criteria === 'gain') sorted.sort((a,b) => getVal(b,'Gain / Perte') - getVal(a,'Gain / Perte'));
    else if (criteria === 'perte') sorted.sort((a,b) => getVal(a,'Gain / Perte') - getVal(b,'Gain / Perte'));
    else if (criteria === 'manquants') sorted = sorted.filter(r => { let a = r.rawData['Achat']; return !(a === 'oui' || a === true); });
    else if (criteria === 'evo+') sorted.sort((a,b) => (getVal(b,'Cote Actuelle')-getVal(b,'Cote -1 mois')) - (getVal(a,'Cote Actuelle')-getVal(a,'Cote -1 mois')));
    else if (criteria === 'evo-') sorted.sort((a,b) => (getVal(a,'Cote Actuelle')-getVal(a,'Cote -1 mois')) - (getVal(b,'Cote Actuelle')-getVal(b,'Cote -1 mois')));
    
    displayGrid(sorted);
};
document.addEventListener('click', () => { const menu = document.getElementById('sort-menu'); if(menu) menu.classList.add('hidden'); });

// --- CHARGEMENT DES ITEMS ---
async function loadItems(brand, type) {
    try {
        const response = await fetch(getUrl(type)); 
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        const rows = data.table.rows;
        const headers = data.table.cols;
        const headerLabels = headers.map(h => h ? h.label : '');
        const m = {
            titre: 0,
            brand: 1,
            photo: (type === 'Jeux') ? 6 : (type === 'Consoles' ? 6 : 2),
            format: (type === 'Consoles') ? 4 : 8,
            achat: (type === 'Consoles') ? 10 : 14,
            console: (type === 'Jeux') ? 4 : (type === 'Accessoires' ? 3 : -1)
        };
        allFetchedItems = rows.filter(r => {
            if (!r.c || !r.c[m.brand]) return false;
            return r.c[m.brand].v.toString().toLowerCase() === brand.toLowerCase();
        }).map(r => {
            let itemData = { _type: type };
            r.c.forEach((cell, i) => { if(headerLabels[i]) itemData[headerLabels[i]] = cell ? cell.v : ''; });
            return { ...r, colMap: m, rawData: itemData };
        });
        if (type !== 'Consoles' && m.console !== -1) {
            const consoles = [...new Set(allFetchedItems.map(r => (r.c[m.console] ? r.c[m.console].v : '')).filter(c => c))].sort();
            const filterBar = document.getElementById('console-filter');
            if (filterBar) {
                consoles.forEach(c => {
                    filterBar.innerHTML += `<button onclick="filterByConsole('${c}', ${m.console}, this)" class="filter-btn px-6 py-2 glass-card text-slate-400 rounded-full font-bold whitespace-nowrap transition-all">${c}</button>`;
                });
            }
        }
        displayGrid(allFetchedItems);
    } catch (e) { console.error("Erreur:", e); }
}

window.filterByConsole = function(consoleName, colIdx, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white', 'shadow-lg');
        b.classList.add('glass-card', 'text-slate-400');
    });
    btn.classList.add('bg-primary', 'text-white', 'shadow-lg');
    btn.classList.remove('glass-card', 'text-slate-400');
    if (consoleName === 'TOUT') { 
        displayGrid(allFetchedItems); 
    } else { 
        const filtered = allFetchedItems.filter(r => {
            // Utilise directement le nom de la colonne pour être sûr
            return r.rawData && r.rawData['Console'] === consoleName;
        }); 
        displayGrid(filtered); 
    }

// --- GRILLE D'AFFICHAGE ---
function displayGrid(items) {
    const grid = document.getElementById('items-grid');
    if(!grid) return;
    grid.innerHTML = '';
    items.forEach(r => {
        const m = r.colMap;
        const title = (r.c[m.titre] && r.c[m.titre].v) ? r.c[m.titre].v : 'Sans Nom';
        const imgUrl = toDirectLink((r.c[m.photo] && r.c[m.photo].v) ? r.c[m.photo].v : '');
        const formatInfo = (r.c[m.format] && r.c[m.format].v) ? r.c[m.format].v : ''; 
        const achatStatus = (r.c[m.achat] && r.c[m.achat].v) ? r.c[m.achat].v : '';
        const isOwned = (achatStatus && (achatStatus.toString().toLowerCase() === 'oui' || r.c[m.achat].v === true));
        const card = document.createElement('div');
        
        card.className = `flex flex-col gap-3 transition-all cursor-pointer ${isOwned ? '' : 'opacity-25 grayscale'}`;
        card.onclick = () => openProductDetail(r.rawData);
        card.innerHTML = `
            <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-xl flex items-center justify-center">
                ${imgUrl ? `<img class="w-full h-full object-contain p-1" src="${imgUrl}" loading="lazy">` : ''}
                ${isOwned ? '<div class="absolute top-2 right-2 flex items-center justify-center size-7 rounded-full bg-primary/80 backdrop-blur-sm text-white shadow-lg z-10 border border-white/20"><span class="material-symbols-outlined !text-[18px] font-bold">workspace_premium</span></div>' : ''}
            </div>
            <div class="px-1 text-center">
                <p class="font-bold text-[11px] leading-tight text-white line-clamp-2 uppercase italic tracking-tighter">${title}</p>
                <p class="text-primary text-[10px] font-black mt-1 uppercase italic tracking-widest">${formatInfo}</p>
            </div>`;
        grid.appendChild(card);
    });
}

// --- MODALE DETAILS ---
function openProductDetail(data) {
    const modal = document.getElementById('game-detail-modal');
    const content = document.getElementById('modal-dynamic-content');
    const keyArt = toDirectLink(data['Key art'] || data['Photo'] || data['Jaquette']);
    const logoNom = toDirectLink(data['Logo Nom']);
    const imageLoose = toDirectLink(data['Image Jeux loose']);
    
    const annee = data['Année de Sortie'] || data['Année'];
    const etat = (data['Etat'] || "").toLowerCase();
    const isOwned = (data['Achat'] === 'oui' || data['Achat'] === true);
    let stars = 0;
    if (etat.includes("neuf")) stars = 5;
    else if (etat.includes("tres bon")) stars = 4;
    else if (etat.includes("bon")) stars = 3;
    else if (etat.includes("correct")) stars = 2;
    else if (etat.includes("mauvais")) stars = 1;

    let starsHtml = "";
    for(let i=1; i<=5; i++) {
        const color = isOwned ? (i <= stars ? "text-yellow-400" : "text-white/20") : "text-white/10";
        starsHtml += `<span class="material-symbols-outlined ${color} !text-2xl">star</span>`;
    }

    content.innerHTML = `
        <div class="flex flex-col w-full bg-black pb-10">
            <div class="w-full bg-black flex items-center justify-center p-4">
                <img src="${keyArt}" class="w-full h-auto object-contain max-h-[45vh] rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            </div>
            <div class="px-6 -mt-4 relative z-10 space-y-4">
                <div class="p-6 rounded-3xl glass-card border border-primary/40 flex flex-col items-center text-center">
                    <div class="flex items-center gap-2 mb-2">
                        <p class="text-primary text-[10px] font-black uppercase italic tracking-widest">${data['Constructeur'] || ''}</p>
                        ${annee ? `<span class="w-1 h-1 rounded-full bg-white/20"></span><p class="text-white/40 text-[10px] font-black uppercase italic tracking-widest">${annee}</p>` : ''}
                    </div>
                    ${logoNom ? `<img src="${logoNom}" class="h-16 w-auto max-w-full object-contain mb-3 mx-auto">` : `<h2 class="text-2xl font-black text-white mb-2 uppercase italic leading-tight">${data['Titre'] || data['Nom'] || 'Détails'}</h2>`}
                    <p class="text-primary text-xs font-black uppercase italic tracking-widest">${data['Console'] || data['Constructeur'] || ''}</p>
                </div>
                <div class="w-full py-4 rounded-3xl glass-card border border-white/10 flex flex-col items-center justify-center bg-white/5">
                    <p class="text-[9px] text-white/40 uppercase font-black mb-1 italic">État du produit</p>
                    <div class="flex gap-1">${starsHtml}</div>
                    <p class="text-[10px] text-white/60 font-bold uppercase mt-1 italic">${data['Etat'] || 'Non spécifié'}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    ${renderStat('Format', data['Format'])}
                    ${renderStat('Prix d\'Achat', data['Prix d\'Achat (€)'] ? data['Prix d\'Achat (€)'] + '€' : '-')}
                    ${renderStat('Cote Jour Achat', data['Cote jour achat'] ? data['Cote jour achat'] + '€' : '-')}
                    ${renderStat('Gain / Perte', data['Gain / Perte'] ? data['Gain / Perte'] + '€' : '-', true)}
                    ${renderStat('Cote Actuelle', data['Cote Actuelle'] ? data['Cote Actuelle'] + '€' : '-')}
                    ${renderStat('Cote +1 Mois', data['Cote + 1 mois'] ? data['Cote + 1 mois'] + '€' : '-')}
                </div>
                <div class="w-full p-6 rounded-3xl glass-card border border-white/10 bg-white/5">
                    <div class="flex justify-between items-center mb-2">
                        <p class="text-[9px] text-white/40 uppercase font-black italic">Évolution 12 mois</p>
                        <span class="text-emerald-400 text-[10px] font-black italic">+12.5%</span>
                    </div>
                    <div class="h-20 w-full relative">
                        <svg class="w-full h-full overflow-visible" viewBox="0 0 400 100">
                            <path d="M0,80 Q50,90 100,50 T200,60 T300,20 T400,40" fill="none" stroke="#b14dff" stroke-width="4" stroke-linecap="round"></path>
                        </svg>
                    </div>
                </div>
                <div class="space-y-2 text-center">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Notes & Observations</h3>
                    <div class="p-5 rounded-3xl bg-white/5 border border-white/5 text-xs text-white/70 italic leading-relaxed text-center">
                        ${data['Notes'] || "Aucune note."}
                    </div>
                </div>
                ${imageLoose ? `<div class="space-y-4 pt-4 text-center">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Vue Produit / Loose</h3>
                    <img src="${imageLoose}" class="w-full h-auto rounded-3xl shadow-2xl border border-white/10 mx-auto">
                </div>` : ''}
            </div>
        </div>`;
    modal.classList.remove('hidden');
    modal.scrollTop = 0;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
}

function renderStat(label, value, isProfit = false) {
    if (!value || value === '€' || value === '0€') return '';
    const color = isProfit ? (value.toString().includes('-') ? 'text-red-400' : 'text-emerald-400') : 'text-white';
    return `<div class="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
            <p class="text-[9px] text-white/40 uppercase font-black mb-1 italic">${label}</p>
            <p class="text-xl font-black italic ${color}">${value}</p>
        </div>`;
}

window.closeGameDetail = function() {
    document.getElementById('game-detail-modal').classList.add('hidden');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
};

// --- INITIALISATION ACCUEIL ---
window.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('app-content');
    if (content) {
        const dashboardHtml = `
            <div class="px-2 mt-8 mb-12">
                <button onclick="showCategories('All', 'Stats')" class="w-full glass-card rounded-[2.5rem] p-5 flex items-center justify-between active:scale-95 transition-all shadow-xl">
                    <div class="flex items-center gap-4">
                        <div class="size-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(157,37,244,0.2)]">
                            <span class="material-symbols-outlined text-primary">analytics</span>
                        </div>
                        <div class="text-left">
                            <p class="text-white font-black italic uppercase text-[13px] leading-none tracking-tight">Tableau de Bord</p>
                            <p class="text-white/40 text-[9px] font-bold uppercase italic mt-1 tracking-widest">Valeur & Stats Globales</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-primary font-black italic text-xs">VOIR</span>
                        <span class="material-symbols-outlined text-primary !text-lg">chevron_right</span>
                    </div>
                </button>
            </div>`;
        content.insertAdjacentHTML('beforeend', dashboardHtml);
    }
    const brands = ['Nintendo', 'Playstation', 'Xbox'];
    brands.forEach(brand => {
        const b = brand.toLowerCase();
        getStats(brand, 'Consoles').then(res => { if(document.getElementById(`count-${b}-consoles`)) document.getElementById(`count-${b}-consoles`).innerText = res; });
        getStats(brand, 'Jeux').then(res => { if(document.getElementById(`count-${b}-jeux`)) document.getElementById(`count-${b}-jeux`).innerText = res; });
        getStats(brand, 'Accessoires').then(res => { if(document.getElementById(`count-${b}-accessoires`)) document.getElementById(`count-${b}-accessoires`).innerText = res; });
    });
});
