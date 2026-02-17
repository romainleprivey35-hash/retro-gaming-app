let allGames = [];
let currentBrand = "";
let activeGameData = null;
let lastScrollY = 0;

const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

// Se lance dès que la page est prête
window.onload = () => {
    preloadData();
    renderMainMenu();
};

async function preloadData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
        const resp = await fetch(url);
        const text = await resp.text();
        allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    } catch(e) { console.error("Erreur chargement Google Sheet"); }
}

function renderMainMenu() {
    document.getElementById('ui-header').style.display = 'none';
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="menu-container">
            <h1 style="text-align:center; margin-top:40px;">Ma Collection</h1>
            <div class="pill-menu">
                <div class="pill nintendo" onclick="selectBrand('Nintendo')">NINTENDO</div>
                <div class="pill playstation" onclick="selectBrand('Playstation')">PLAYSTATION</div>
                <div class="pill xbox" onclick="selectBrand('Xbox')">XBOX</div>
            </div>
        </div>`;
}

function selectBrand(brand) {
    currentBrand = brand;
    let color = "#333";
    if (brand.includes("Nintendo")) color = "#e60012";
    if (brand.includes("Playstation")) color = "#00439c";
    if (brand.includes("Xbox")) color = "#107c10";
    document.documentElement.style.setProperty('--brand-color', color);
    showCategories();
}

function showCategories() {
    document.getElementById('ui-header').style.display = 'block';
    document.getElementById('ui-header').innerHTML = `<button onclick="renderMainMenu()">⬅ RETOUR</button>`;
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="menu-container">
            <h1 style="text-align:center; margin-top:80px;">${currentBrand.toUpperCase()}</h1>
            <div class="pill-menu">
                <div class="pill" style="background:var(--brand-color)" onclick="fetchGamesByBrand()">🎮 JEUX</div>
                <div class="pill" style="background:var(--brand-color)" onclick="fetchConsolesByBrand()">🕹️ CONSOLES</div>
                <div class="pill" style="background:var(--brand-color)" onclick="fetchAccessoriesByBrand()">🎧 ACCESSOIRES</div>
            </div>
        </div>`;
}

function toggleScroll(lock) {
    if (lock) {
        lastScrollY = window.scrollY;
        document.body.style.top = `-${lastScrollY}px`;
        document.body.classList.add('no-scroll');
    } else {
        document.body.classList.remove('no-scroll');
        window.scrollTo(0, lastScrollY);
    }
}

function handleCardClick(imgSrc, data) {
    activeGameData = data;
    document.getElementById('ui-header').style.display = 'none';
    toggleScroll(true);
    
    const overlay = document.getElementById('overlay');
    const floating = document.getElementById('floating-card');
    
    floating.innerHTML = `<img src="${imgSrc}" style="width:100%; border-radius:15px;">`;
    floating.className = ''; 
    overlay.style.display = 'block';
    setTimeout(() => overlay.classList.add('active'), 10);
    floating.style.display = 'block';
    void floating.offsetWidth;
    floating.classList.add('animate-zoom');
}

function handleFloatingClick() {
    const floating = document.getElementById('floating-card');
    const detail = document.getElementById('full-detail');
    
    floating.classList.add('scale-out-ver-center');

    setTimeout(() => {
        detail.innerHTML = `
            <button onclick="closeFullDetail()" style="background:var(--brand-color);color:white;border:none;padding:15px;border-radius:10px;width:90%;font-weight:bold;position:absolute;top:20px;">✕ FERMER</button>
            <img src="${activeGameData.img}" style="max-width:80%; max-height:35vh; object-fit:contain; border-radius:10px;">
            <h1 style="text-align:center; margin:20px 0;">${activeGameData.title}</h1>
            <div style="background:#f4f4f4; padding:20px; border-radius:15px; width:80%;">
                <p><b>Console :</b> ${activeGameData.console}</p>
                <p><b>Prix :</b> ${activeGameData.price}€</p>
                <p><b>Possédé :</b> ${activeGameData.owned}</p>
            </div>`;
        
        floating.style.display = 'none';
        detail.className = ''; 
        void detail.offsetWidth;
        detail.classList.add('scale-in-ver-center');
    }, 450);
}

function closeOverlay() {
    const floating = document.getElementById('floating-card');
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('active');
    floating.classList.add('animate-reverse');
    setTimeout(() => {
        floating.style.display = 'none';
        overlay.style.display = 'none';
        document.getElementById('ui-header').style.display = 'block';
        toggleScroll(false);
    }, 500);
}

function closeFullDetail() {
    const detail = document.getElementById('full-detail');
    const viewList = document.getElementById('view-list');
    
    detail.classList.replace('scale-in-ver-center', 'scale-out-ver-center');

    setTimeout(() => {
        detail.style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('overlay').classList.remove('active');
        
        viewList.classList.remove('scale-in-ver-center');
        void viewList.offsetWidth;
        viewList.classList.add('scale-in-ver-center');
        
        document.getElementById('ui-header').style.display = 'block'; 
        toggleScroll(false);
    }, 500);
}

function renderGeneralGrid(items, title) {
    document.getElementById('ui-header').style.display = 'block';
    document.getElementById('ui-header').innerHTML = `<button onclick="showCategories()">⬅ RETOUR</button>`;
    const view = document.getElementById('view-list');
    view.innerHTML = `<h2 style="text-align:center; margin-top:100px;">${title}</h2>`;
    const grid = document.createElement('div');
    grid.className = 'game-grid';
    items.forEach(g => {
        const card = document.createElement('div');
        card.className = 'game-card';
        if (g.owned?.toString().toUpperCase().includes('NON')) { card.style.opacity = '0.35'; card.style.filter = 'grayscale(100%)'; }
        card.onclick = () => handleCardClick(g.img, g);
        card.innerHTML = `<img src="${g.img}">`;
        grid.appendChild(card);
    });
    view.appendChild(grid);
}

async function fetchGamesByBrand() {
    const filtered = allGames.filter(row => (row.c[2]?.v || "").toLowerCase().includes(currentBrand.toLowerCase()))
                             .map(row => ({ title: row.c[0]?.v, img: toDirectLink(row.c[6]?.v), price: row.c[12]?.v, owned: row.c[14]?.v || "NON", console: row.c[4]?.v }));
    renderGeneralGrid(filtered, "JEUX");
}

async function fetchConsolesByBrand() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.CONSOLES}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    const items = rows.filter(row => (row.c[3]?.v || "").toLowerCase().includes(currentBrand.toLowerCase()))
                      .map(row => ({ title: row.c[0]?.v, img: toDirectLink(row.c[1]?.v), console: row.c[3]?.v, owned: row.c[4]?.v || "NON", price: "N/A" }));
    renderGeneralGrid(items, "CONSOLES");
}

async function fetchAccessoriesByBrand() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.ACCESSOIRES}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    const items = rows.filter(row => (row.c[5]?.v || "").toLowerCase().includes(currentBrand.toLowerCase()))
                      .map(row => ({
