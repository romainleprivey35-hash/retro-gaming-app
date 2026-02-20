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
    const headerTitle = document.getElementById('header-title');
    const header = document.getElementById('dynamic-header');
    
    if (header) header.style.opacity = 1;
    if (headerTitle) headerTitle.innerText = `${type} ${brand}`;

    content.innerHTML = `
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
            titre: findIdx(headers, 'Titre'),
            brand: findIdx(headers, 'Constructeur'),
            photo: findIdx(headers, 'Jaquette'),
            format: findIdx(headers, 'Format'),
            achat: findIdx(headers, 'Achat'),
            console: findIdx(headers, 'Console'),
            // Ajout explicite des colonnes manquantes
            logoNom: findIdx(headers, 'Logo Nom'), // Colonne C
            keyArt: findIdx(headers, 'Key art'),   // Colonne F
            imageLoose: findIdx(headers, 'Image Jeux loose') // Colonne H
        };

        allFetchedItems = rows.filter(r => {
            if (!r.c || !r.c[m.brand]) return false;
            const itemBrand = r.c[m.brand].v || ''; 
            return itemBrand.toString().toLowerCase() === brand.toLowerCase();
        }).map(r => {
            // Mapping manuel pour être sûr de ne rien rater
            let itemData = {
                titre: r.c[m.titre] ? r.c[m.titre].v : '',
                brand: r.c[m.brand] ? r.c[m.brand].v : '',
                console: r.c[m.console] ? r.c[m.console].v : '',
                format: r.c[m.format] ? r.c[m.format].v : '',
                etat: r.c[findIdx(headers, 'Etat')] ? r.c[findIdx(headers, 'Etat')].v : '',
                cote: r.c[findIdx(headers, 'Cote Actuelle')] ? r.c[findIdx(headers, 'Cote Actuelle')].v : '',
                prixAchat: r.c[findIdx(headers, 'Prix d\'Achat (€)')] ? r.c[findIdx(headers, 'Prix d\'Achat (€)')].v : '',
                gainPerte: r.c[findIdx(headers, 'Gain / Perte')] ? r.c[findIdx(headers, 'Gain / Perte')].v : '',
                notes: r.c[findIdx(headers, 'Notes')] ? r.c[findIdx(headers, 'Notes')].v : '',
                annee: r.c[findIdx(headers, 'Année de Sortie')] ? r.c[findIdx(headers, 'Année de Sortie')].v : '',
                // Les Images
                logoNomUrl: r.c[m.logoNom] ? toDirectLink(r.c[m.logoNom].v) : '',
                keyArtUrl: r.c[m.keyArt] ? toDirectLink(r.c[m.keyArt].v) : '',
                imageLooseUrl: r.c[m.imageLoose] ? toDirectLink(r.c[m.imageLoose].v) : '',
                jaquetteUrl: r.c[m.photo] ? toDirectLink(r.c[m.photo].v) : ''
            };
            return { ...r, colMap: m, rawData: itemData };
        });

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

function displayGrid(items) {
    const grid = document.getElementById('items-grid');
    if(!grid) return;
    grid.innerHTML = '';

    items.forEach(r => {
        const m = r.colMap;
        const d = r.rawData;
        const achatStatus = (r.c[m.achat] && r.c[m.achat].v) ? r.c[m.achat].v : '';
        const isOwned = (achatStatus && achatStatus.toString().toLowerCase() !== 'non' && achatStatus !== '');
        
        const card = document.createElement('div');
        card.className = `flex flex-col gap-3 transition-all cursor-pointer ${isOwned ? '' : 'opacity-25 grayscale'}`;
        card.onclick = () => openProductDetail(d);

        card.innerHTML = `
            <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/5 bg-black/40 shadow-xl flex items-center justify-center">
                ${d.jaquetteUrl ? `<img class="w-full h-full object-contain p-1" src="${d.jaquetteUrl}" loading="lazy">` : ''}
                ${isOwned ? '<div class="absolute top-2 right-2 bg-primary text-[8px] font-black px-2 py-1 rounded-full text-white uppercase shadow-lg z-10">OWNED</div>' : ''}
            </div>
            <div class="px-1">
                <p class="font-bold text-[11px] leading-tight text-white line-clamp-2 uppercase italic tracking-tighter">${d.titre}</p>
                <p class="text-primary text-[10px] font-black mt-1 uppercase italic tracking-widest">${d.format}</p>
            </div>`;
        grid.appendChild(card);
    });
}

function openProductDetail(d) {
    const modal = document.getElementById('game-detail-modal');
    const content = document.getElementById('modal-dynamic-content');
    
    content.innerHTML = `
        <div class="relative w-full bg-black flex items-center justify-center" style="min-height: 280px;">
            <img src="${d.keyArtUrl || d.jaquetteUrl}" class="w-full h-auto object-contain max-h-[50vh]">
            <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
            
            <div class="absolute bottom-6 left-6 right-6 p-6 rounded-xl glass-panel border border-primary/20">
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase italic">${d.console}</span>
                    <span class="px-3 py-1 rounded-full bg-slate-800/50 text-slate-300 text-[10px] font-black uppercase italic">${d.annee}</span>
                </div>
                
                ${d.logoNomUrl ? 
                    `<img src="${d.logoNomUrl}" class="h-14 w-auto object-contain mb-2">` : 
                    `<h2 class="text-3xl font-black text-white mb-1 uppercase italic">${d.titre}</h2>`
                }
                <p class="text-primary text-xs font-black uppercase italic tracking-widest">${d.brand}</p>
            </div>
        </div>

        <div class="px-6 mt-8 space-y-8 pb-12">
            <div class="grid grid-cols-2 gap-4">
                ${renderStat('État', d.etat)}
                ${renderStat('Cote Actuelle', d.cote ? d.cote + '€' : null)}
                ${renderStat('Prix d\'Achat', d.prixAchat ? d.prixAchat + '€' : null)}
                ${renderStat('Gain / Perte', d.gainPerte ? d.gainPerte + '€' : null, true)}
            </div>

            <div class="space-y-3">
                <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 italic">
                    <span class="material-symbols-outlined text-primary text-lg">description</span> Notes Collection
                </h3>
                <div class="p-5 rounded-2xl bg-slate-900/50 border border-white/5 font-medium text-xs text-slate-400 leading-relaxed italic">
                    ${d.notes || "Aucune note enregistrée."}
                </div>
            </div>

            ${d.imageLooseUrl ? `
            <div class="space-y-4">
                <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 italic">
                    <span class="material-symbols-outlined text-primary text-lg">straighten</span> Vue Produit / Loose
                </h3>
                <div class="rounded-3xl overflow-hidden border border-white/10 bg-black/20 p-2 shadow-2xl">
                    <img src="${d.imageLooseUrl}" class="w-full h-auto rounded-2xl shadow-inner">
                </div>
            </div>` : ''}
        </div>
    `;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function renderStat(label, value, isProfit = false) {
    if (!value || value === '€' || value === '0€') return '';
    const color = isProfit ? (value.toString().includes('-') ? 'text-red-400' : 'text-emerald-400') : 'text-white';
    return `
        <div class="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p class="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1 italic">${label}</p>
            <p class="text-xl font-black italic ${color}">${value}</p>
        </div>`;
}

window.closeGameDetail = function() {
    document.getElementById('game-detail-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
};

window.addEventListener('scroll', () => {
    const title = document.getElementById('header-title');
    const searchBtn = document.querySelector('button[onclick="openSearch()"]');
    if (!title || !searchBtn) return;
    const opacity = Math.max(0, 1 - (window.scrollY / 60));
    title.style.opacity = opacity;
    searchBtn.style.opacity = opacity;
    title.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
    searchBtn.style.visibility = opacity <= 0 ? 'hidden' : 'visible';
});
