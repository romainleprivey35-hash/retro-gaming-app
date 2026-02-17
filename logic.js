let allGames = [];
let currentBrand = "";
let activeGameData = null;

const CONSOLE_ORDER = {
    "NES": 1, "SNES": 2, "N64": 3, "GameCube": 4, "Wii": 5, "Wii U": 6, "Switch": 7,
    "PS1": 10, "PS2": 11, "PS3": 12, "PS4": 13, "PS5": 14,
    "Xbox": 20, "Xbox 360": 21, "Xbox One": 22, "Xbox Series": 23
};

const toDirectLink = (id) => {
    if (!id) return "";
    const match = id.toString().match(/id=([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : id;
};

window.onload = () => { renderMainMenu(); preloadData(); };

async function preloadData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
        const resp = await fetch(url);
        const text = await resp.text();
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        allGames = jsonData.table.rows;
    } catch (e) { console.error("Erreur Sheets :", e); }
}

function renderMainMenu() {
    document.getElementById('ui-header').style.display = 'none';
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="menu-container">
            <h1 style="text-align:center; margin-top:60px;">Ma Collection</h1>
            <div class="pill-menu">
                <div class="pill nintendo" onclick="selectBrand('Nintendo')">NINTENDO</div>
                <div class="pill playstation" onclick="selectBrand('Playstation')">PLAYSTATION</div>
                <div class="pill xbox" onclick="selectBrand('Xbox')">XBOX</div>
            </div>
        </div>`;
}

function selectBrand(brand) {
    currentBrand = brand;
    const colors = { 'Nintendo': '#e60012', 'Playstation': '#00439c', 'Xbox': '#107c10' };
    document.documentElement.style.setProperty('--brand-color', colors[brand]);
    
    let filtered = allGames.map(r => ({
        title: r.c[0]?.v || "Sans titre",
        brand: r.c[2]?.v || "",
        console: r.c[4]?.v || "Inconnue",
        img: toDirectLink(r.c[6]?.v || ""),
        owned: (r.c[14]?.v || "NON").toUpperCase()
    })).filter(game => game.brand.toLowerCase().includes(brand.toLowerCase()));

    filtered.sort((a, b) => (CONSOLE_ORDER[a.console] || 999) - (CONSOLE_ORDER[b.console] || 999));
    renderGrid(filtered);
}

function renderGrid(items) {
    const view = document.getElementById('view-list');
    view.innerHTML = '<div class="game-grid"></div>';
    const grid = view.querySelector('.game-grid');
    let lastConsole = "";

    document.getElementById('ui-header').style.display = 'block';
    document.getElementById('ui-header').innerHTML = `<button onclick="renderMainMenu()">⬅ RETOUR</button>`;

    items.forEach(item => {
        if (item.console !== lastConsole) {
            const sep = document.createElement('div');
            sep.className = 'console-separator';
            sep.innerText = item.console;
            grid.appendChild(sep);
            lastConsole = item.console;
        }

        const div = document.createElement('div');
        div.className = 'game-card' + (item.owned === "NON" ? ' not-owned' : '');
        div.onclick = () => {
            activeGameData = item;
            const card = document.getElementById('floating-card');
            card.innerHTML = `<img src="${item.img}">`;
            card.style.display = 'block';
            card.className = 'animate-zoom';
            document.getElementById('overlay').style.display = 'block';
        };
        div.innerHTML = `<img src="${item.img}" loading="lazy">`;
        grid.appendChild(div);
    });
}

function handleFloatingClick() {
    const detail = document.getElementById('full-detail');
    document.getElementById('floating-card').style.display = 'none';
    detail.innerHTML = `
        <button onclick="closeFullDetail()" style="position:absolute; top:20px; background:var(--brand-color); color:white; border:none; padding:15px; border-radius:10px; width:80%;">✕ FERMER</button>
        <img src="${activeGameData.img}" style="max-height:40%; border-radius:10px; margin-bottom:20px; margin-top:60px;">
        <h2 style="text-align:center;">${activeGameData.title}</h2>
        <p><b>Console :</b> ${activeGameData.console}</p>`;
    detail.className = 'scale-in-ver-center';
    detail.style.display = 'flex';
}

function closeFullDetail() {
    const detail = document.getElementById('full-detail');
    detail.className = 'scale-out-ver-center';
    setTimeout(() => {
        detail.style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    }, 400);
}

function closeOverlay() {
    document.getElementById('floating-card').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
