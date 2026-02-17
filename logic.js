let allGames = [];
let currentBrand = "";
let activeGameData = null;

const toDirectLink = (id) => {
    const match = id?.match(/id=([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : id;
};

window.onload = () => { renderMainMenu(); preloadData(); };

async function preloadData() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
    const resp = await fetch(url);
    const text = await resp.text();
    allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
}

function renderMainMenu() {
    document.getElementById('ui-header').style.display = 'none';
    const view = document.getElementById('view-list');
    view.className = '';
    view.innerHTML = `
        <div class="menu-container">
            <h1 style="text-align:center;">Ma Collection</h1>
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
    showCategories();
}

function showCategories() {
    document.getElementById('ui-header').style.display = 'block';
    document.getElementById('ui-header').innerHTML = `<button onclick="renderMainMenu()">⬅ RETOUR</button>`;
    document.getElementById('view-list').innerHTML = `
        <div class="menu-container">
            <h1 style="text-align:center; margin-top:80px;">${currentBrand.toUpperCase()}</h1>
            <div class="pill-menu">
                <div class="pill" style="background:var(--brand-color)" onclick="fetchGames()">🎮 JEUX</div>
            </div>
        </div>`;
}

function fetchGames() {
    const filtered = allGames.filter(r => (r.c[2]?.v || "").includes(currentBrand))
                             .map(r => ({ title: r.c[0]?.v, img: toDirectLink(r.c[6]?.v), console: r.c[4]?.v, owned: r.c[14]?.v }));
    renderGrid(filtered);
}

function renderGrid(items) {
    const view = document.getElementById('view-list');
    view.innerHTML = '<div class="game-grid"></div>';
    const grid = view.querySelector('.game-grid');
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'game-card';
        if(item.owned === "NON") div.style.opacity = "0.35";
        div.onclick = () => {
            activeGameData = item;
            const card = document.getElementById('floating-card');
            card.innerHTML = `<img src="${item.img}" style="width:100%; border-radius:15px;">`;
            card.style.display = 'block';
            card.className = 'animate-zoom';
            document.getElementById('overlay').style.display = 'block';
        };
        div.innerHTML = `<img src="${item.img}">`;
        grid.appendChild(div);
    });
}

function handleFloatingClick() {
    const detail = document.getElementById('full-detail');
    document.getElementById('floating-card').classList.add('scale-out-ver-center');
    setTimeout(() => {
        detail.innerHTML = `
            <button onclick="closeFullDetail()" style="position:absolute; top:20px; background:var(--brand-color); color:white; border:none; padding:15px; border-radius:10px; width:80%;">✕ FERMER</button>
            <img src="${activeGameData.img}" style="max-height:40%; border-radius:10px; margin-bottom:20px;">
            <h2 style="text-align:center;">${activeGameData.title}</h2>
            <p><b>Console :</b> ${activeGameData.console}</p>`;
        document.getElementById('floating-card').style.display = 'none';
        detail.className = 'scale-in-ver-center';
    }, 400);
}

function closeFullDetail() {
    const detail = document.getElementById('full-detail');
    detail.className = 'scale-out-ver-center';
    setTimeout(() => {
        detail.style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('view-list').className = 'scale-in-ver-center';
    }, 450);
}

function closeOverlay() {
    document.getElementById('floating-card').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
