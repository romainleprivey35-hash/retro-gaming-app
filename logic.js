let allGames = [];
let currentBrand = "";
let activeGameData = null;

const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

window.onload = () => {
    renderMainMenu();
    preloadData();
};

async function preloadData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
        const resp = await fetch(url);
        const text = await resp.text();
        allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    } catch (e) { console.log("Erreur de chargement"); }
}

function renderMainMenu() {
    document.getElementById('ui-header').style.display = 'none';
    const view = document.getElementById('view-list');
    view.className = ''; // Reset animations
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
    let color = brand === "Nintendo" ? "#e60012" : brand === "Playstation" ? "#00439c" : "#107c10";
    document.documentElement.style.setProperty('--brand-color', color);
    showCategories();
}

function showCategories() {
    const header = document.getElementById('ui-header');
    header.style.display = 'block';
    header.innerHTML = `<button onclick="renderMainMenu()">⬅ RETOUR</button>`;
    
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

function handleCardClick(imgSrc, data) {
    activeGameData = data;
    document.getElementById('ui-header').style.display = 'none'; // Cache le retour
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
            <button onclick="closeFullDetail()" style="background:var(--brand-color);color:white;border:none;padding:15px;border-radius:10px;width:80%;font-weight:bold;position:absolute;top:20px;">✕ FERMER</button>
            <img src="${activeGameData.img}" style="max-width:80%; max-height:35vh; object-fit:contain; border-radius:10px;">
            <h1 style="text-align:center;">${activeGameData.title}</h1>
            <div style="background:#f4f4f4; padding:20px; border-radius:15px; width:80%;">
                <p><b>Console :</b> ${activeGameData.console}</p>
                <p><b>Prix :</b> ${activeGameData.price}€</p>
            </div>`;
        
        floating.style.display = 'none';
        detail.className = 'scale-in-ver-center'; 
    }, 400);
}

function closeFullDetail() {
    const detail = document.getElementById('full-detail');
    const viewList = document.getElementById('view-list');
    
    detail.className = 'scale-out-ver-center';

    setTimeout(() => {
        detail.style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('overlay').classList.remove('active');
        
        viewList.className = 'scale-in-ver-center'; // La liste revient avec ton effet
        document.getElementById('ui-header').style.display = 'block'; 
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
    }, 500);
}

function renderGeneralGrid(items, title) {
    const header = document.getElementById('ui-header');
    header.style.display = 'block';
    header.innerHTML = `<button onclick="showCategories()">⬅ RETOUR</button>`;
    
    const view = document.getElementById('view-list');
    view.innerHTML = `<h2 style="text-align:center; margin-top:100px;">${title}</h2>`;
    const grid = document.createElement('div');
    grid.className = 'game-grid';
    items.forEach(g => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.onclick = () => handleCardClick(g.img, g);
        card.innerHTML = `<img src="${g.img}">`;
        grid.appendChild(card);
    });
    view.appendChild(grid);
}

async function fetchGamesByBrand() {
    const filtered = allGames.filter(row => (row.c[2]?.v || "").toLowerCase().includes(currentBrand.toLowerCase()))
                             .map(row => ({ title: row.c[0]?.v, img: toDirectLink(row.c[6]?.v), price: row.c[12]?.v, console: row.c[4]?.v }));
    renderGeneralGrid(filtered, "JEUX");
}
