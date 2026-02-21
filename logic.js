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

// --- CALCUL DES STATS (AVEC TES INDEX RÉELS) ---
async function getStats(brand, sheetName) {
    try {
        const response = await fetch(getUrl(sheetName));
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        const rows = data.table.rows;
        
        let bIdx = 1; // Constructeur (2ème colonne)
        let aIdx = (sheetName === 'Consoles') ? 10 : 14; // Achat (11ème ou 15ème colonne)

        let total = 0, owned = 0;
        rows.forEach((r, index) => {
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

// --- AFFICHAGE DU MENU CATEGORIES (VERSION PILULES + STATS) ---
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
                <button onclick="${brand === 'All' ? 'window.location.reload()' : `showCategories('${brand}', 'Menu')`}" class="w-12 h-12 flex items-center justify-center rounded-full glass-card text-white shadow-2xl border border-white/10">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
            </div>
            <div class="pt-20 px-4 space-y-6">
                <div class="glass-card rounded-[2.5rem] p-8 relative overflow-hidden border border-white/10 bg-slate-900/40 text-center">
                    <p class="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic mb-2">Valeur Estimée ${brand === 'All' ? 'Totale' : brand}</p>
                    <h2 id="stat-total-value" class="text-4xl font-black text-white italic">... €</h2>
                    <div class="mt-8 h-24 w-full relative">
                        <svg class="w-full h-full overflow-visible" viewBox="0 0 400 100">
                            <path d="M0,80 Q50,90 100,50 T200,60 T300,20 T400,40" fill="none" stroke="#9d25f4" stroke-width="4" stroke-linecap="round"></path>
                        </svg>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div class="glass-card p-6 rounded-3xl border border-white/5 bg-slate-800/40">
                        <p class="text-[9px] text-slate-500 font-black uppercase italic mb-1">Investi</p>
                        <p id="stat-total-spent" class="text-xl font-black text-white italic">... €</p>
                    </div>
                    <div class="glass-card p-6 rounded-3xl border border-white/5 bg-slate-800/40">
                        <p class="text-[9px] text-slate-500 font-black uppercase italic mb-1">Plus-Value</p>
                        <p id="stat-total-profit" class="text-xl font-black text-emerald-400 italic">... €</p>
                    </div>
                </div>
            </div>`;
        calculateDetailedStats(brand);
        return;
    }

    content.innerHTML = `
        <div class="fixed top-6 left-6 z-50">
            <button onclick="window.location.reload()" class="w-12 h-12 flex items-center justify-center rounded-full glass-card text-white shadow-2xl border border-white/10">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
        <div class="pt-20 px-2">
            <div class="relative w-full rounded-[3.5rem] overflow-hidden glass-card border border-white/10 flex flex-col items-center justify-center text-center p-8 bg-slate-900/50">
                <div class="h-24 w-full flex items-center justify-center mb-8">
                    <img src="https://drive.google.com/thumbnail?id=${logos[brand]}&sz=w1000" class="max-h-full object-contain">
                </div>
                <div class="flex gap-2 mb-8 w-full justify-center">
                    ${['Consoles', 'Jeux', 'Accessoires'].map(cat => `
                        <button onclick="showCategories('${brand}', '${cat}')" class="bg-slate-800/40 border border-white/5 px-3 py-4 rounded-[2rem] flex flex-col items-center min-w-[90px] active:scale-95 transition-all">
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
    const sheets = ['Consoles', 'Jeux', 'Accessoires'];
    for (const s of sheets) {
        try {
            const response = await fetch(getUrl(s));
            const text = await response.text();
            const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
            const data = JSON.parse(jsonString);
            const rows = data.table.rows;
            const bIdx = 1;
            const cIdx = (s === 'Consoles') ? 11 : 12; 
            const pIdx = (s === 'Consoles') ? 12 : 16; 
            rows.forEach(r => {
                if (r.c && r.c[bIdx] && r.c[bIdx].v && (brand === 'All' || r.c[bIdx].v.toLowerCase() === brand.toLowerCase())) {
                    const cote = r.c[cIdx] ? parseFloat(r.c[cIdx].v) || 0 : 0;
                    const prix = r.c[pIdx] ? parseFloat(r.c[pIdx].v) || 0 : 0;
                    tValue += cote;
                    tSpent += prix;
                }
            });
        } catch (e) {}
    }
    const profit = tValue - tSpent;
    document.getElementById('stat-total-value').innerText = `${tValue.toLocaleString()} €`;
    document.getElementById('stat-total-spent').innerText = `${tSpent.toLocaleString()} €`;
    document.getElementById('stat-total-profit').innerText = `${profit > 0 ? '+' : ''}${profit.toLocaleString()} €`;
}

// --- LAYOUT DE LA LISTE ---
function renderListLayout(brand, type) {
    const content = document.getElementById('app-content');
    content.innerHTML = `
        <div class="fixed top-6 left-4 z-50">
            <button onclick="window.location.reload()" class="w-12 h-12 flex items-center justify-center rounded-full glass-card text-white shadow-2xl border border-white/20 backdrop-blur-md">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
        <div class="pt-20">
            ${type !== 'Consoles' ? `
            <div id="console-filter" class="flex overflow-x-auto gap-3 py-4 no-scrollbar px-4 mb-2" style="scrollbar-width: none;">
                <button id="btn-tout" onclick="filterByConsole('TOUT', null, this)" class="filter-btn px-6 py-2 bg-primary text-white rounded-full font-bold whitespace-nowrap shadow-lg">TOUT</button>
            </div>` : ''}
            <div id="items-grid" class="grid grid-cols-2 gap-4 px-4 pb-10 text-white">
                <div class="col-span-2 text-center py-20 text-slate-500 italic animate-pulse">CHARGEMENT...</div>
            </div>
        </div>`;
}

// --- CHARGEMENT DES ITEMS (INDEX RÉELS) ---
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
                filterBar.innerHTML = `<button id="btn-tout" onclick="filterByConsole('TOUT', ${m.console}, this)" class="filter-btn px-6 py-2 bg-primary text-white rounded-full font-bold whitespace-nowrap shadow-lg">TOUT</button>`;
                consoles.forEach(c => {
                    filterBar.innerHTML += `<button onclick="filterByConsole('${c}', ${m.console}, this)" class="filter-btn px-6 py-2 glass-card text-slate-400 rounded-full font-bold whitespace-nowrap border border-white/10 transition-all">${c}</button>`;
                });
            }
        }
        displayGrid(allFetchedItems);
    } catch (e) { console.error("Erreur:", e); }
}

window.filterByConsole = function(consoleName, colIdx, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white', 'shadow-lg');
        b.classList.add('glass-card', 'text-slate-400', 'border-white/10');
    });
    btn.classList.add('bg-primary', 'text-white', 'shadow-lg');
    btn.classList.remove('glass-card', 'text-slate-400', 'border-white/10');
    if (consoleName === 'TOUT') { displayGrid(allFetchedItems); } 
    else { const filtered = allFetchedItems.filter(r => r.c[colIdx] && r.c[colIdx].v === consoleName); displayGrid(filtered); }
};

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
        const isOwned = (achatStatus && achatStatus.toString().toLowerCase() === 'oui' || r.c[m.achat].v === true);
        const card = document.createElement('div');
        card.className = `flex flex-col gap-3 transition-all cursor-pointer ${isOwned ? '' : 'opacity-25 grayscale'}`;
        card.onclick = () => openProductDetail(r.rawData);
        card.innerHTML = `
            <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 shadow-xl flex items-center justify-center">
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
    const keys = Object.keys(data);
    const anneeKey = keys.find(k => k.toLowerCase().includes('année'));
    const anneeVal = anneeKey ? data[anneeKey] : '';
    const consoleVal = data['Console'] || data['Console Associée'] || '';
    let badgesHtml = '';
    if (data['_type'] === 'Consoles') {
        if (anneeVal) badgesHtml = `<span class="px-4 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase italic">${anneeVal}</span>`;
    } else {
        if (consoleVal) badgesHtml += `<span class="px-4 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase italic">${consoleVal}</span>`;
        if (anneeVal) badgesHtml += `<span class="px-4 py-1 rounded-full bg-slate-800/50 text-slate-300 text-[10px] font-black uppercase italic">${anneeVal}</span>`;
    }
    content.innerHTML = `
        <div class="flex flex-col w-full bg-background-dark pb-10">
            <div class="w-full bg-black flex items-center justify-center p-4">
                <img src="${keyArt}" class="w-full h-auto object-contain max-h-[50vh] rounded-xl shadow-2xl">
            </div>
            <div class="px-6 -mt-4 relative z-10">
                <div class="p-6 rounded-2xl glass-panel border border-primary/20 shadow-2xl flex flex-col items-center text-center">
                    <div class="flex flex-wrap justify-center gap-2 mb-4">${badgesHtml}</div>
                    ${logoNom ? `<img src="${logoNom}" class="h-16 w-auto max-w-full object-contain mb-3 mx-auto">` : `<h2 class="text-2xl font-black text-white mb-2 uppercase italic leading-tight">${data['Titre'] || data['Nom'] || 'Détails'}</h2>`}
                    <p class="text-primary text-xs font-black uppercase italic tracking-widest">${data['Constructeur'] || ''}</p>
                </div>
            </div>
            <div class="px-6 mt-8 space-y-8 text-center">
                <div class="grid grid-cols-2 gap-4">
                    ${renderStat('État', data['Etat'])}
                    ${renderStat('Cote Actuelle', data['Cote Actuelle'] ? data['Cote Actuelle'] + '€' : null)}
                    ${renderStat('Prix d\'Achat', data['Prix d\'Achat (€)'] ? data['Prix d\'Achat (€)'] + '€' : null)}
                    ${renderStat('Gain / Perte', data['Gain / Perte'] ? data['Gain / Perte'] + '€' : null, true)}
                </div>
                <div class="space-y-3">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Notes</h3>
                    <div class="p-5 rounded-2xl bg-slate-900/50 border border-white/5 text-xs text-slate-400 italic">
                        ${data['Notes'] || "Aucune note."}
                    </div>
                </div>
                ${imageLoose ? `<div class="space-y-4">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Vue Produit / Loose</h3>
                    <img src="${imageLoose}" class="w-full h-auto rounded-2xl shadow-2xl">
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
    return `<div class="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p class="text-[9px] text-slate-500 uppercase font-black mb-1 italic">${label}</p>
            <p class="text-xl font-black italic ${color}">${value}</p>
        </div>`;
}

window.closeGameDetail = function() {
    document.getElementById('game-detail-modal').classList.add('hidden');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
};

// --- INITIALISATION ACCUEIL AVEC LA PILULE TABLEAU DE BORD ---
window.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('app-content');
    if (content) {
        // Ajout de la pilule au début du contenu
        const dashboardHtml = `
            <div class="px-2 mb-8">
                <button onclick="showCategories('All', 'Stats')" class="w-full glass-card rounded-[2.5rem] p-5 border border-white/10 bg-slate-900/40 flex items-center justify-between active:scale-95 transition-all shadow-xl">
                    <div class="flex items-center gap-4">
                        <div class="size-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span class="material-symbols-outlined text-primary">analytics</span>
                        </div>
                        <div class="text-left">
                            <p class="text-white font-black italic uppercase text-[13px] leading-none tracking-tight">Tableau de Bord</p>
                            <p class="text-slate-500 text-[9px] font-bold uppercase italic mt-1 tracking-widest">Valeur & Stats Globales</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-primary font-black italic text-xs">VOIR</span>
                        <span class="material-symbols-outlined text-primary !text-lg">chevron_right</span>
                    </div>
                </button>
            </div>`;
        
        // On injecte au début si on est sur la vue principale (qui contient Nintendo, etc.)
        content.insertAdjacentHTML('afterbegin', dashboardHtml);
    }

    const brands = ['Nintendo', 'Playstation', 'Xbox'];
    brands.forEach(brand => {
        const b = brand.toLowerCase();
        getStats(brand, 'Consoles').then(res => { if(document.getElementById(`count-${b}-consoles`)) document.getElementById(`count-${b}-consoles`).innerText = res; });
        getStats(brand, 'Jeux').then(res => { if(document.getElementById(`count-${b}-jeux`)) document.getElementById(`count-${b}-jeux`).innerText = res; });
        getStats(brand, 'Accessoires').then(res => { if(document.getElementById(`count-${b}-accessoires`)) document.getElementById(`count-${b}-accessoires`).innerText = res; });
    });
});
