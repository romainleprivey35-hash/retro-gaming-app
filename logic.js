let allGames = [];
let currentBrand = "";
let activeGameData = null;

const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

// Sécurité : Charger les données au début
preloadData();

async function preloadData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
        const resp = await fetch(url);
        const text = await resp.text();
        allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    } catch(e) { console.error("Erreur de chargement", e); }
}

function selectBrand(brand) {
    let color = "#333";
    if (brand.includes("Nintendo")) color = "#e60012";
    if (brand.includes("Playstation")) color = "#00439c";
    if (brand.includes("Xbox")) color = "#107c10";
    currentBrand = brand;
    document.documentElement.style.setProperty('--brand-color', color);
    showCategories();
}

function showCategories() {
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="sticky-header"><button onclick="location.reload()">⬅ Retour</button></div>
        <div class="menu-container">
            <h2 class="main-title">${currentBrand.toUpperCase()}</h2>
            <div class="pill-menu">
                <div class="pill" style="background:var(--brand-color)" onclick="fetchGamesByBrand()">🎮 JEUX</div>
                <div class="pill" style="background:var(--brand-color)" onclick="fetchConsolesByBrand()">🕹️ CONSOLES</div>
                <div class="pill" style="background:var(--brand-color)" onclick="fetchAccessoriesByBrand()">🎧 ACCESSOIRES</div>
            </div>
        </div>`;
}

// --- GESTION DES FENÊTRES ET SCROLL ---

function toggleScroll(isFixed) {
    if (isFixed) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
}

function handleCardClick(imgSrc, data) {
    activeGameData = data;
    const overlay = document.getElementById('overlay');
    const floating = document.getElementById('floating-card');
    
    toggleScroll(true); // Bloque le scroll
    document.getElementById('view-list').classList.remove('scale-in-ver-center');

    floating.innerHTML = `<img src="${imgSrc}">`;
    floating.className = ''; 
    overlay.style.display = 'block';
    setTimeout(() => overlay.classList.add('active'), 10); // Fade in overlay
    
    floating.style.display = 'block';
    void floating.offsetWidth; 
    floating.classList.add('animate-zoom');
}

function handleFloatingClick() {
    const floating = document.getElementById('floating-card');
    const detail = document.getElementById('full-detail');
    
    floating.classList.add('scale-out-ver-detail'); // Utilise l'effet d'écrasement flouté

    setTimeout(() => {
        detail.innerHTML = `
            <button onclick="closeFullDetail()" style="background:var(--brand-color);color:white;border:none;padding:15px;border-radius:10px;width:100%;font-weight:bold;margin-bottom:20px;">✕ FERMER</button>
            <img src="${activeGameData.img}" style="width:100%; max-height:250px; object-fit:contain; margin-bottom:20px;">
            <h1 style="text-align:center;">${activeGameData.title}</h1>
            <div style="background:#f9f9f9; padding:20px; border-radius:15px; border:1px solid #eee;">
                <p><b>Console :</b> ${activeGameData.console}</p>
                <p><b>Prix :</b> ${activeGameData.price}€</p>
                <p><b>Possédé :</b> ${activeGameData.owned}</p>
            </div>`;
        
        floating.style.display = 'none';
        detail.style.display = 'block';
        detail.classList.add('scale-in-ver-center'); // Rideau qui s'ouvre
    }, 300);
}

function closeOverlay() {
    const floating = document.getElementById('floating-card');
    const overlay = document.getElementById('overlay');
    
    overlay.classList.remove('active'); // Fade out overlay
    floating.classList.add('animate-reverse');
    
    setTimeout(() => {
        floating.style.display = 'none';
        overlay.style.display = 'none';
        toggleScroll(false); // Libère le scroll
    }, 600);
}

function closeFullDetail() {
    const detail = document.getElementById('full-detail');
    const overlay = document.getElementById('overlay');
    const viewList = document.getElementById('view-list');
    
    detail.classList.add('scale-out-ver-detail'); // Écrase + Flou la fiche
    overlay.classList.remove('active');

    setTimeout(() => {
        detail.style.display = 'none';
        overlay.style.display = 'none';
        document.getElementById('floating-card').style.display = 'none';
        
        // DÉPLOIEMENT DE LA LISTE (L'effet Rideau inverse)
        viewList.classList.remove('scale-in-ver-center');
        void viewList.offsetWidth;
        viewList.classList.add('scale-in-ver-center');
        
        toggleScroll(false); // Libère le scroll
    }, 450);
}

// --- RENDU DES GRILLES ---

function renderGrid(items, view, isCategorized = false) {
    const gridContainer = document.createElement('div');
    gridContainer.className = 'game-grid';
    
    items.forEach(g => {
        const card = document.createElement('div');
        card.className = 'game-card';
        if (g.owned?.toString().toUpperCase().includes('NON')) {
            card.style.opacity = '0.35';
            card.style.filter = 'grayscale(100%)';
        }
        card.onclick = () => handleCardClick(g.img, g);
        card.innerHTML = `<img src="${g.img}">`;
        gridContainer.appendChild(card);
    });
    view.appendChild(gridContainer);
}

async function fetchGamesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:100px;">JEUX</h2>`;
    
    const filtered = allGames.filter(row => (row.c[2]?.v || "").toLowerCase().includes(currentBrand.toLowerCase()))
                             .map(row => ({
                                title: row.c[0]?.v, img: toDirectLink(row.c[6]?.v), 
                                price: row.c[12]?.v, owned: row.c[14]?.v || "NON", 
                                console: row.c[4]?.v
                             }));
    renderGrid(filtered, view);
}

// ... Les fonctions fetchConsoles et fetchAccessories suivraient le même modèle renderGrid ...
