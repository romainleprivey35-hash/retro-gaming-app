const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU';
const getUrl = (sheetName) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;

let allFetchedItems = []; 

function toDirectLink(val) {
    if (!val) return "";
    const str = val.toString();
    const match = str.match(/[-\w]{25,}/); 
    return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w800` : "";
}

const findIdx = (headers, name) => headers.findIndex(h => h && h.label && h.label.trim().toLowerCase() === name.toLowerCase());

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector('nav');
    if (nav) nav.remove();
});

// --- FONCTION DE CALCUL POUR TES CHIFFRES ../.. ---
async function getStats(brand, sheetName) {
    try {
        const response = await fetch(getUrl(sheetName));
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        const rows = data.table.rows;
        const headers = data.table.cols;
        const bIdx = findIdx(headers, 'Constructeur');
        const aIdx = findIdx(headers, 'Achat');
        let total = 0, owned = 0;
        rows.forEach(r => {
            if (r.c && r.c[bIdx] && r.c[bIdx].v && r.c[bIdx].v.toString().toLowerCase() === brand.toLowerCase()) {
                total++;
                if (r.c[aIdx] && r.c[aIdx].v && r.c[aIdx].v.toString().toLowerCase() === 'oui') owned++;
            }
        });
        return `${owned} / ${total}`;
    } catch (e) { return "0 / 0"; }
}

window.showCategories = async function(brand, type = 'Menu') {
    const content = document.getElementById('app-content');
    if (!content) return;
    if (type !== 'Menu') {
        renderListLayout(brand, type);
        loadItems(brand, type);
        return;
    }

    // TES LOGOS DRIVE
    const logos = {
        'Nintendo': '1T7p_0-uD4oMvU0F9zI-G6-E6m8j5tY6O',
        'PlayStation': '1O7R_vM6Qv_0e-A-o8U6E7v-M6R_vM6Qv',
        'Xbox': '1X7B_vM6Qv_0e-A-o8U6E7v-M6R_vM6Qv'
    };

    // 1. BLOC UNIQUE AVEC LOGO ET NOMS CONSOLES CENTRÉS
    content.innerHTML = `
        <div class="fixed top-6 left-6 z-50">
            <button onclick="window.location.reload()" class="w-12 h-12 flex items-center justify-center rounded-full glass-card text-white shadow-2xl border border-white/10">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
        </div>
        <div class="pt-20 px-2">
            <div class="relative w-full h-44 rounded-3xl overflow-hidden glass-card mb-8 border border-white/10 flex flex-col items-center justify-center text-center p-6">
                <img src="https://drive.google.com/thumbnail?id=${logos[brand]}&sz=w1000" class="h-16 object-contain mb-4">
                <p class="text-[10px] text-primary font-bold uppercase tracking-widest">NES • SNES • N64 • GC • WII • SWITCH</p>
            </div>

            <div class="grid gap-4 w-full px-2">
                ${['Consoles', 'Jeux', 'Accessoires'].map(cat => `
                    <div onclick="showCategories('${brand}', '${cat}')" class="glass-card rounded-2xl p-6 bg-slate-800/50 border border-white/5 cursor-pointer active:scale-95 transition-all">
                        <div class="flex justify-between items-center text-white text-xl font-black uppercase italic">
                            <span>${cat}</span>
                            <div class="flex items-center gap-3">
                                <span id="stat-${cat}" class="text-[10px] bg-primary px-3 py-1 rounded-full font-black text-white">... / ...</span>
                                <span class="material-symbols-outlined">chevron_right</span>
                            </div>
                        </div>
                    </div>`).join('')}
            </div>
        </div>`;

    // Lancement du calcul des nombres réels
    document.getElementById('stat-Consoles').innerText = await getStats(brand, 'Consoles');
    document.getElementById('stat-Jeux').innerText = await getStats(brand, 'Jeux');
    document.getElementById('stat-Accessoires').innerText = await getStats(brand, 'Accessoires');
};

// --- LE RESTE DE TON CODE (AUCUN CHANGEMENT ICI) ---

function renderListLayout(brand, type) {
    const content = document.getElementById('app-content');
    const headerTitle = document.getElementById('header-title');
    const header = document.getElementById('dynamic-header');
    if (header) header.style.opacity = 1;
    if (headerTitle) headerTitle.innerText = `${type} ${brand}`;
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
    } catch (e) { console.error("Erreur Technique:", e); }
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

function displayGrid(items) {
    const grid = document.getElementById('items-grid');
    if(!grid) return;
    grid.innerHTML = '';
    items.forEach(r => {
        const m = r.colMap;
        const title = (r.c[m.titre] && r.c[m.titre].v) ? r.c[m.titre].v : 'Sans Nom';
        const rawPhoto = (r.c[m.photo] && r.c[m.photo].v) ? r.c[m.photo].v : '';
        const imgUrl = toDirectLink(rawPhoto);
        const formatInfo = (r.c[m.format] && r.c[m.format].v) ? r.c[m.format].v : ''; 
        const achatStatus = (r.c[m.achat] && r.c[m.achat].v) ? r.c[m.achat].v : '';
        const isOwned = (achatStatus && achatStatus.toString().toLowerCase() !== 'non' && achatStatus !== '');
        const card = document.createElement('div');
        card.className = `flex flex-col gap-3 transition-all cursor-pointer ${isOwned ? '' : 'opacity-25 grayscale'}`;
        card.onclick = () => openProductDetail(r.rawData);
        card.innerHTML = `
            <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 shadow-xl flex items-center justify-center">
                ${imgUrl ? `<img class="w-full h-full object-contain p-1" src="${imgUrl}" loading="lazy">` : ''}
                ${isOwned ? '<div class="absolute top-2 right-2 bg-primary text-[8px] font-black px-2 py-1 rounded-full text-white uppercase shadow-lg z-10">OWNED</div>' : ''}
            </div>
            <div class="px-1 text-center">
                <p class="font-bold text-[11px] leading-tight text-white line-clamp-2 uppercase italic tracking-tighter">${title}</p>
                <p class="text-primary text-[10px] font-black mt-1 uppercase italic tracking-widest">${formatInfo}</p>
            </div>`;
        grid.appendChild(card);
    });
}

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
        <div class="flex flex-col w-full bg-background-dark">
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
            <div class="px-6 mt-8 space-y-8 pb-12 text-center">
                <div class="grid grid-cols-2 gap-4 text-center">
                    ${renderStat('État', data['Etat'])}
                    ${renderStat('Cote Actuelle', data['Cote Actuelle'] ? data['Cote Actuelle'] + '€' : null)}
                    ${renderStat('Prix d\'Achat', data['Prix d\'Achat (€)'] ? data['Prix d\'Achat (€)'] + '€' : null)}
                    ${renderStat('Gain / Perte', data['Gain / Perte'] ? data['Gain / Perte'] + '€' : null, true)}
                </div>
                <div class="space-y-3">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex justify-center items-center gap-2 italic">
                        <span class="material-symbols-outlined text-primary text-lg">description</span> Notes
                    </h3>
                    <div class="p-5 rounded-2xl bg-slate-900/50 border border-white/5 font-medium text-xs text-slate-400 leading-relaxed italic text-center">
                        ${data['Notes'] || "Aucune note enregistrée."}
                    </div>
                </div>
                ${imageLoose ? `<div class="space-y-4">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex justify-center items-center gap-2 italic">
                        <span class="material-symbols-outlined text-primary text-lg">straighten</span> Vue Produit / Loose
                    </h3>
                    <div class="rounded-3xl overflow-hidden border border-white/10 bg-black/20 p-2 shadow-2xl flex justify-center">
                        <img src="${imageLoose}" class="w-full h-auto rounded-2xl">
                    </div>
                </div>` : ''}
            </div>
        </div>`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

function renderStat(label, value, isProfit = false) {
    if (!value || value === '€' || value === '0€') return '';
    const color = isProfit ? (value.toString().includes('-') ? 'text-red-400' : 'text-emerald-400') : 'text-white';
    return `<div class="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
            <p class="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1 italic text-center">${label}</p>
            <p class="text-xl font-black italic ${color} text-center">${value}</p>
        </div>`;
}

window.closeGameDetail = function() {
    document.getElementById('game-detail-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
};
