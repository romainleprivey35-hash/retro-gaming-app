let allGames = [];
let currentBrand = "";
let activeGameData = null;

const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

async function preloadData() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
    const resp = await fetch(url);
    const text = await resp.text();
    allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
}

function selectBrand(brand) {
    let color = "#333";
    if (brand.includes("Nintendo")) color = "#e60012";
    if (brand.includes("Sony") || brand.includes("Playstation")) { color = "#00439c"; currentBrand = "Playstation"; }
    else currentBrand = brand;
    if (brand.includes("Xbox")) color = "#107c10";
    document.documentElement.style.setProperty('--brand-color', color);
    showCategories();
}

function showCategories() {
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="sticky-header"><button onclick="location.reload()">⬅ Retour</button></div>
        <h2 style="text-align:center; margin-top:80px;">${currentBrand.toUpperCase()}</h2>
        <div class="game-grid">
            <div class="game-card" onclick="fetchGamesByBrand()"><div style="height:100%;display:flex;align-items:center;justify-content:center;font-weight:bold;">🎮 JEUX</div></div>
            <div class="game-card" onclick="fetchConsolesByBrand()"><div style="height:100%;display:flex;align-items:center;justify-content:center;font-weight:bold;">🕹️ CONSOLES</div></div>
            <div class="game-card" onclick="fetchAccessoriesByBrand()"><div style="height:100%;display:flex;align-items:center;justify-content:center;font-weight:bold;">🎧 ACCESSOIRES</div></div>
        </div>`;
}

// --- ANIMATIONS ---

function handleCardClick(imgSrc, data) {
    activeGameData = data;
    const viewList = document.getElementById('view-list');
    const overlay = document.getElementById('overlay');
    const floating = document.getElementById('floating-card');
    
    viewList.classList.remove('unblur-fade'); 
    floating.innerHTML = `<img src="${imgSrc}">`;
    floating.className = ''; 
    overlay.style.display = 'block';
    floating.style.display = 'block';
    void floating.offsetWidth; 
    floating.classList.add('animate-zoom');
}

function handleFloatingClick() {
    const floating = document.getElementById('floating-card');
    const detail = document.getElementById('full-detail');
    
    floating.classList.add('scale-out-center-ver');

    setTimeout(() => {
        detail.innerHTML = `
            <button onclick="closeFullDetail()" style="background:var(--brand-color);color:white;border:none;padding:15px;border-radius:10px;width:100%;font-weight:bold;margin-bottom:20px;">✕ FERMER</button>
            <img src="${activeGameData.img}" style="width:100%; max-height:250px; object-fit:contain; margin-bottom:20px;">
            <h1 style="text-align:center;">${activeGameData.title}</h1>
            <div style="background:#f9f9f9; padding:20px; border-radius:15px; border:1px solid #eee;">
                <p><b>Console :</b> ${activeGameData.console}</p>
                <p><b>Prix :</b> ${activeGameData.price}€</p>
                <p><b>Achat :</b> ${activeGameData.owned}</p>
            </div>`;
        
        floating.style.display = 'none';
        detail.style.display = 'block';
        detail.classList.add('scale-in-center-ver');
    }, 300);
}

function closeOverlay() {
    const floating = document.getElementById('floating-card');
    const overlay = document.getElementById('overlay');
    const viewList = document.getElementById('view-list');
    
    floating.classList.remove('animate-zoom');
    void floating.offsetWidth; 
    floating.classList.add('animate-reverse');
    
    // Le flou commence un tout petit peu après pour la fluidité
    setTimeout(() => {
        viewList.classList.add('unblur-fade');
    }, 100);

    setTimeout(() => {
        floating.style.display = 'none';
        overlay.style.display = 'none';
        floating.classList.remove('animate-reverse');
    }, 600);
}

function closeFullDetail() {
    const detail = document.getElementById('full-detail');
    const overlay = document.getElementById('overlay');
    const viewList = document.getElementById('view-list');
    
    detail.classList.remove('scale-in-center-ver');
    void detail.offsetWidth;
    detail.classList.add('scale-out-center-ver-detail');
    
    setTimeout(() => {
        viewList.classList.add('unblur-fade');
    }, 100);

    setTimeout(() => {
        detail.style.display = 'none';
        overlay.style.display = 'none';
        document.getElementById('floating-card').style.display = 'none';
        detail.classList.remove('scale-out-center-ver-detail');
    }, 400);
}

// --- LOGIQUE RENDU ---

function renderGrid(groups, view) {
    for (const c in groups) {
        const titleDiv = document.createElement('div');
        titleDiv.style.padding = "15px 15px 0"; titleDiv.innerHTML = `<b>${c}</b>`;
        view.appendChild(titleDiv);
        const grid = document.createElement('div'); grid.className = 'game-grid';
        groups[c].forEach(g => {
            const card = document.createElement('div'); card.className = 'game-card';
            if (g.owned && g.owned.toString().toUpperCase().includes('NON')) {
                card.style.opacity = '0.4'; card.style.filter = 'contrast(0.8)';
            }
            card.onclick = () => handleCardClick(g.img, g);
            card.innerHTML = `<img src="${g.img}">`;
            grid.appendChild(card);
        });
        view.appendChild(grid);
    }
}

function renderSimpleGrid(items, view) {
    const grid = document.createElement('div'); grid.className = 'game-grid';
    items.forEach(g => {
        const card = document.createElement('div'); card.className = 'game-card';
        if (g.owned && g.owned.toString().toUpperCase().includes('NON')) {
            card.style.opacity = '0.4'; card.style.filter = 'contrast(0.8)';
        }
        card.onclick = () => handleCardClick(g.img, g);
        card.innerHTML = `<img src="${g.img}">`;
        grid.appendChild(card);
    });
    view.appendChild(grid);
}

// --- FETCH FUNCTIONS ---

async function fetchGamesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div id="overlay" onclick="closeOverlay()"></div><div id="floating-card" onclick="event.stopPropagation(); handleFloatingClick()"></div><div id="full-detail"></div><div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">JEUX</h2>`;
    if (allGames.length === 0) await preloadData();
    const groups = {};
    allGames.forEach(row => {
        if ((row.c[2]?.v || "").toLowerCase().includes(currentBrand.toLowerCase())) {
            const c = row.c[4]?.v || "Autre";
            if (!groups[c]) groups[c] = [];
            groups[c].push({ title: row.c[0]?.v, img: toDirectLink(row.c[6]?.v), price: row.c[12]?.v, owned: row.c[14]?.v || "NON", console: c });
        }
    });
    renderGrid(groups, view);
}

async function fetchConsolesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div id="overlay" onclick="closeOverlay()"></div><div id="floating-card" onclick="event.stopPropagation(); handleFloatingClick()"></div><div id="full-detail"></div><div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">CONSOLES</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.CONSOLES}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    const items = rows.filter(row => (row.c[3]?.v || "").toLowerCase().includes(currentBrand.toLowerCase()))
                      .map(row => ({ title: row.c[0]?.v, img: toDirectLink(row.c[1]?.v), console: row.c[3]?.v, price: "N/A", owned: row.c[4]?.v || "NON" }));
    renderSimpleGrid(items, view);
}

async function fetchAccessoriesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div id="overlay" onclick="closeOverlay()"></div><div id="floating-card" onclick="event.stopPropagation(); handleFloatingClick()"></div><div id="full-detail"></div><div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">ACCESSOIRES</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.ACCESSOIRES}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    const items = rows.filter(row => (row.c[5]?.v || "").toLowerCase().includes(currentBrand.toLowerCase()))
                      .map(row => ({ title: row.c[0]?.v, img: toDirectLink(row.c[1]?.v), console: row.c[2]?.v, price: "N/A", owned: row.c[4]?.v || "NON" }));
    renderSimpleGrid(items, view);
}
