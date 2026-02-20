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
            r.c.forEach((cell, i) => {
                if(headerLabels[i]) itemData[headerLabels[i]] = cell ? cell.v : '';
            });
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
            <div class="px-1">
                <p class="font-bold text-[11px] leading-tight text-white line-clamp-2 uppercase italic tracking-tighter">${title}</p>
                <p class="text-primary text-[10px] font-black mt-1 uppercase italic tracking-widest">${formatInfo}</p>
            </div>`;
        grid.appendChild(card);
    });
}

function openProductDetail(data) {
    const modal = document.getElementById('game-detail-modal');
    const content = document.getElementById('modal-dynamic-content');
    
    const keyArt = toDirectLink(data['Key art'] || data['Photo']);
    const logoNom = toDirectLink(data['Logo Nom']);
    const imageLoose = toDirectLink(data['Image Jeux loose']);

    content.innerHTML = `
        <div class="relative w-full bg-black flex items-center justify-center overflow-hidden" style="min-height: 250px;">
            <img src="${keyArt}" class="w-full h-auto object-contain max-h-[60vh]">
            <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
            
            <div class="absolute bottom-6 left-6 right-6 p-6 rounded-xl glass-panel border border-primary/20">
                <div class="flex flex-wrap gap-2 mb-4">
                    <span class="px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-tighter">${data['Console'] || ''}</span>
                    <span class="px-3 py-1 rounded-full bg-slate-800/50 text-slate-300 text-[10px] font-black uppercase tracking-tighter">${data['Année de Sortie'] || ''}</span>
                </div>
                
                ${logoNom ? 
                    `<img src="${logoNom}" class="h-16 w-auto object-contain mb-2">` : 
                    `<h2 class="text-3xl font-black text-white mb-1 uppercase italic">${data['Titre'] || data['Nom']}</h2>`
                }
                <p class="text-primary text-xs font-black uppercase italic tracking-widest">${data['Constructeur'] || ''}</p>
            </div>
        </div>

        <div class="px-6 mt-8 space-y-8 pb-12">
            <div class="grid grid-cols-2 gap-4">
                ${renderStat('État', data['Etat'])}
                ${renderStat('Cote Actuelle', data['Cote Actuelle'] ? data['Cote Actuelle'] + '€' : null)}
                ${renderStat('Prix d\'Achat', data['Prix d\'Achat (€)'] ? data['Prix d\'Achat (€)'] + '€' : null)}
                ${renderStat('Gain / Perte', data['Gain / Perte'] ? data['Gain / Perte'] + '€' : null, true)}
            </div>

            <div class="space-y-3">
                <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-lg">description</span> Notes
                </h3>
                <div class="p-5 rounded-2xl bg-slate-900/50 border border-white/5 font-medium text-xs text-slate-400 leading-relaxed italic">
                    ${data['Notes'] || "Aucune note pour cet exemplaire."}
                </div>
            </div>

            ${imageLoose ? `
            <div class="space-y-4">
                <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-lg">photo_library</span> Vue Produit
                </h3>
                <div class="rounded-3xl overflow-hidden border border-white/10 bg-black/20 p-2 shadow-2xl">
                    <img src="${imageLoose}" class="w-full h-auto rounded-2xl">
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
            <p class="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">${label}</p>
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
