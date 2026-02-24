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

// --- AFFICHAGE DU MENU CATEGORIES (MODIFIÉ POUR LE CARROUSEL 3 PAGES) ---
window.showCategories = async function(brand, type = 'Menu') {
    const content = document.getElementById('app-content');
    if (!content) return;
    
    if (type === 'Stats') {
        renderStatsPage(brand);
        return;
    }

    if (type !== 'Menu') {
        renderCarouselLayout(brand, type);
        return;
    }

    const bLower = brand.toLowerCase();
    const logos = {
        'Nintendo': '11g1hLkCEY-wLQgMOHuDdRcmBbq33Lkn7',
        'PlayStation': '1XzZYJwDRWiPBpW-16TGYPcTYSGRB-fC0',
        'Xbox': '1SzJdKKuHIv5M3bGNc9noed8mN60fNm9y'
    };

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
                    ${['Jeux', 'Consoles', 'Accessoires'].map(cat => `
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

// --- NOUVEAU LAYOUT : CARROUSEL HORIZONTAL 3 PAGES ---
function renderCarouselLayout(brand, initialType) {
    const content = document.getElementById('app-content');
    content.innerHTML = `
        <div class="fixed top-6 left-4 z-50 flex items-center gap-4">
            <button onclick="window.location.reload()" class="w-10 h-10 flex items-center justify-center rounded-full glass-card text-white shadow-2xl">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 class="text-white font-black italic uppercase text-xs tracking-[0.2em]">${brand}</h2>
        </div>

        <div class="fixed top-7 right-6 z-50 flex gap-1.5">
            <div id="dot-Jeux" class="size-1.5 rounded-full bg-white/20 transition-all duration-300"></div>
            <div id="dot-Consoles" class="size-1.5 rounded-full bg-white/20 transition-all duration-300"></div>
            <div id="dot-Accessoires" class="size-1.5 rounded-full bg-white/20 transition-all duration-300"></div>
        </div>

        <div id="main-carousel" class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-screen w-screen scroll-smooth">
            <div id="page-Jeux" class="snap-start min-w-full h-full pt-24 overflow-y-auto px-4 pb-20">
                <p class="text-primary font-black italic uppercase text-[10px] mb-4 tracking-widest px-2">Ma Collection / Jeux</p>
                <div id="grid-Jeux" class="grid grid-cols-2 gap-4"></div>
            </div>
            <div id="page-Consoles" class="snap-start min-w-full h-full pt-24 overflow-y-auto px-4 pb-20">
                <p class="text-primary font-black italic uppercase text-[10px] mb-4 tracking-widest px-2">Ma Collection / Consoles</p>
                <div id="grid-Consoles" class="grid grid-cols-2 gap-4"></div>
            </div>
            <div id="page-Accessoires" class="snap-start min-w-full h-full pt-24 overflow-y-auto px-4 pb-20">
                <p class="text-primary font-black italic uppercase text-[10px] mb-4 tracking-widest px-2">Ma Collection / Accessoires</p>
                <div id="grid-Accessoires" class="grid grid-cols-2 gap-4"></div>
            </div>
        </div>
    `;

    // Chargement des données pour chaque page
    loadPageItems(brand, 'Jeux', 'grid-Jeux');
    loadPageItems(brand, 'Consoles', 'grid-Consoles');
    loadPageItems(brand, 'Accessoires', 'grid-Accessoires');

    // Gestion du scroll pour les points
    const carousel = document.getElementById('main-carousel');
    carousel.addEventListener('scroll', () => {
        const index = Math.round(carousel.scrollLeft / window.innerWidth);
        const categories = ['Jeux', 'Consoles', 'Accessoires'];
        categories.forEach((cat, i) => {
            const dot = document.getElementById(`dot-${cat}`);
            if (i === index) {
                dot.className = 'size-1.5 rounded-full bg-primary shadow-[0_0_8px_#b14dff]';
            } else {
                dot.className = 'size-1.5 rounded-full bg-white/20';
            }
        });
    });

    // Positionnement sur la page demandée
    setTimeout(() => {
        const target = document.getElementById(`page-${initialType}`);
        if(target) target.scrollIntoView({ behavior: 'auto' });
    }, 50);
}

// --- CHARGEMENT SPECIFIQUE POUR LE CARROUSEL ---
async function loadPageItems(brand, type, gridId) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '<div class="col-span-2 text-center py-10 text-white/20 text-[10px] font-black italic uppercase tracking-widest">Chargement...</div>';
    
    try {
        const response = await fetch(getUrl(type)); 
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        const rows = data.table.rows;
        const headers = data.table.cols.map(h => h ? h.label : '');
        
        const m = {
            titre: 0,
            brand: 1,
            photo: (type === 'Jeux') ? 6 : (type === 'Consoles' ? 6 : 2),
            format: (type === 'Consoles') ? 4 : 8,
            achat: (type === 'Consoles') ? 10 : 14
        };

        const filtered = rows.filter(r => r.c && r.c[m.brand] && r.c[m.brand].v.toString().toLowerCase() === brand.toLowerCase());

        grid.innerHTML = '';
        filtered.forEach(r => {
            const title = (r.c[m.titre] && r.c[m.titre].v) ? r.c[m.titre].v : 'Sans Nom';
            const imgUrl = toDirectLink((r.c[m.photo] && r.c[m.photo].v) ? r.c[m.photo].v : '');
            const achatStatus = (r.c[m.achat] && r.c[m.achat].v) ? r.c[m.achat].v : '';
            const isOwned = (achatStatus && achatStatus.toString().toLowerCase() === 'oui' || r.c[m.achat].v === true);
            
            let itemData = { _type: type };
            r.c.forEach((cell, i) => { if(headers[i]) itemData[headers[i]] = cell ? cell.v : ''; });

            const card = document.createElement('div');
            card.className = `flex flex-col gap-3 transition-all ${isOwned ? '' : 'opacity-25 grayscale'}`;
            card.onclick = () => openProductDetail(itemData);
            card.innerHTML = `
                <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-xl flex items-center justify-center">
                    ${imgUrl ? `<img class="w-full h-full object-contain p-1" src="${imgUrl}" loading="lazy">` : ''}
                    ${isOwned ? '<div class="absolute top-2 right-2 flex items-center justify-center size-6 rounded-full bg-primary/80 backdrop-blur-sm text-white shadow-lg z-10 border border-white/20"><span class="material-symbols-outlined !text-[14px] font-bold">workspace_premium</span></div>' : ''}
                </div>
                <div class="px-1">
                    <p class="font-bold text-[10px] leading-tight text-white truncate uppercase italic tracking-tighter">${title}</p>
                </div>`;
            grid.appendChild(card);
        });
    } catch (e) { grid.innerHTML = 'Erreur'; }
}

// --- PAGE ANALYTIQUES (AVEC TES CARROUSELS DE CLASSEMENT) ---
function renderStatsPage(brand) {
    const content = document.getElementById('app-content');
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
                <div class="glass-card p-6 rounded-3xl">
                    <p class="text-[9px] text-slate-400 font-black uppercase italic mb-1">Investi</p>
                    <p id="stat-total-spent" class="text-xl font-black text-white italic">... €</p>
                </div>
                <div class="glass-card p-6 rounded-3xl">
                    <p class="text-[9px] text-slate-400 font-black uppercase italic mb-1">Plus-Value</p>
                    <p id="stat-total-profit" class="text-xl font-black text-emerald-400 italic">... €</p>
                </div>
            </div>

            <div class="glass-card rounded-[2rem] p-6 overflow-hidden">
                <p class="text-white font-black italic uppercase text-xs mb-6 tracking-widest">🏆 Hall of Fame (Possédés)</p>
                <div id="owned-rankings" class="flex overflow-x-auto gap-4 no-scrollbar scroll-smooth">
                    <div class="text-center text-slate-500 italic text-[10px] py-4 w-full">Analyse...</div>
                </div>
            </div>

            <div class="glass-card rounded-[2rem] p-6 overflow-hidden">
                <p class="text-white font-black italic uppercase text-xs mb-6 tracking-widest">🎯 Priorités d'Achat</p>
                <div id="wishlist-rankings" class="flex overflow-x-auto gap-4 no-scrollbar scroll-smooth">
                    <div class="text-center text-slate-500 italic text-[10px] py-4 w-full">Analyse...</div>
                </div>
            </div>
        </div>`;
    calculateDetailedStats(brand);
}

// --- LOGIQUE CALCUL STATS (INCHANGÉ) ---
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

function renderRankings(ownedData, wishData) {
    const ownedContainer = document.getElementById('owned-rankings');
    const wishlistContainer = document.getElementById('wishlist-rankings');
    if(!ownedContainer || !wishlistContainer) return;
    const sortFn = (a, b) => b.cote - a.cote;

    const createCards = (data, cats) => {
        let items = [];
        cats.forEach(c => { items = items.concat(data[c.name].sort(sortFn).slice(0, c.limit)); });
        return items.map((item, idx) => `
            <div onclick='openProductDetail(${JSON.stringify(item.rawData)})' class="flex-none w-32 space-y-2">
                <div class="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                    <img src="${toDirectLink(item.photo)}" class="w-full h-full object-cover">
                    <div class="absolute top-1 left-1 bg-primary px-1.5 rounded text-[8px] font-black text-white">#${idx+1}</div>
                </div>
                <p class="text-[9px] text-white font-bold truncate uppercase italic leading-tight">${item.titre}</p>
                <p class="text-primary font-black text-[9px] italic">${item.cote}€</p>
            </div>`).join('');
    };

    ownedContainer.innerHTML = createCards(ownedData, [{ name: 'Jeux', limit: 10 }, { name: 'Consoles', limit: 5 }]);
    wishlistContainer.innerHTML = createCards(wishData, [{ name: 'Jeux', limit: 10 }, { name: 'Consoles', limit: 5 }]);
}

// --- MODALE DETAILS (INCHANGÉ) ---
function openProductDetail(data) {
    const modal = document.getElementById('game-detail-modal');
    const content = document.getElementById('modal-dynamic-content');
    const keyArt = toDirectLink(data['Key art'] || data['Photo'] || data['Jaquette']);
    const logoNom = toDirectLink(data['Logo Nom']);
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
                <img src="${keyArt}" class="w-full h-auto object-contain max-h-[45vh] rounded-xl">
            </div>
            <div class="px-6 -mt-4 relative z-10 space-y-4">
                <div class="p-6 rounded-3xl glass-card border border-primary/40 text-center">
                    <p class="text-primary text-[10px] font-black uppercase italic mb-1">${data['Constructeur'] || ''}</p>
                    ${logoNom ? `<img src="${logoNom}" class="h-12 mx-auto mb-2">` : `<h2 class="text-xl font-black text-white uppercase italic">${data['Titre'] || 'Détails'}</h2>`}
                    <p class="text-primary text-[10px] font-black uppercase italic">${data['Console'] || ''}</p>
                </div>
                <div class="w-full py-4 rounded-3xl glass-card border border-white/10 flex flex-col items-center justify-center bg-white/5">
                    <div class="flex gap-1">${starsHtml}</div>
                    <p class="text-[10px] text-white/60 font-bold uppercase mt-1 italic">${data['Etat'] || 'Non spécifié'}</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    ${renderStat('Format', data['Format'])}
                    ${renderStat('Cote Actuelle', data['Cote Actuelle'] ? data['Cote Actuelle'] + '€' : '-')}
                </div>
                <div class="p-5 rounded-3xl bg-white/5 border border-white/5 text-xs text-white/70 italic text-center">
                    ${data['Notes'] || "Aucune note."}
                </div>
            </div>
        </div>`;
    modal.classList.remove('hidden');
    modal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
}

function renderStat(label, value, isProfit = false) {
    if (!value || value === '€' || value === '0€') return '';
    const color = isProfit ? (value.toString().includes('-') ? 'text-red-400' : 'text-emerald-400') : 'text-white';
    return `<div class="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
            <p class="text-[9px] text-white/40 uppercase font-black mb-1 italic">${label}</p>
            <p class="text-sm font-black italic ${color}">${value}</p>
        </div>`;
}

window.closeGameDetail = function() {
    document.getElementById('game-detail-modal').classList.add('hidden');
    document.body.style.overflow = '';
};

// --- INITIALISATION ACCUEIL (INCHANGÉ) ---
window.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('app-content');
    if (content) {
        content.insertAdjacentHTML('beforeend', `
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
                    <span class="material-symbols-outlined text-primary !text-lg">chevron_right</span>
                </button>
            </div>`);
    }

    ['Nintendo', 'Playstation', 'Xbox'].forEach(brand => {
        const b = brand.toLowerCase();
        getStats(brand, 'Consoles').then(res => { if(document.getElementById(`count-${b}-consoles`)) document.getElementById(`count-${b}-consoles`).innerText = res; });
        getStats(brand, 'Jeux').then(res => { if(document.getElementById(`count-${b}-jeux`)) document.getElementById(`count-${b}-jeux`).innerText = res; });
        getStats(brand, 'Accessoires').then(res => { if(document.getElementById(`count-${b}-accessoires`)) document.getElementById(`count-${b}-accessoires`).innerText = res; });
    });
});
