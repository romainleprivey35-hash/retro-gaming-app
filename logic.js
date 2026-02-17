let allGames = [];
let currentBrand = "";
let activeItem = null;

// Initialisation simple
window.onload = () => {
    renderMenu();
    preload();
};

async function preload() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
    const resp = await fetch(url);
    const text = await resp.text();
    allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
}

function renderMenu() {
    document.getElementById('ui-header').style.display = 'none';
    document.getElementById('view-list').innerHTML = `
        <div class="menu-container">
            <h1 style="text-align:center; margin-bottom:30px;">Ma Collection</h1>
            <div class="pill nintendo" onclick="selectBrand('Nintendo')">NINTENDO</div>
            <div class="pill playstation" onclick="selectBrand('Playstation')">PLAYSTATION</div>
            <div class="pill xbox" onclick="selectBrand('Xbox')">XBOX</div>
        </div>`;
}

function selectBrand(brand) {
    currentBrand = brand;
    const colors = { 'Nintendo': '#e60012', 'Playstation': '#00439c', 'Xbox': '#107c10' };
    document.documentElement.style.setProperty('--brand-color', colors[brand]);
    
    document.getElementById('ui-header').style.display = 'block';
    document.getElementById('ui-header').innerHTML = `<button onclick="renderMenu()">⬅ RETOUR</button>`;
    
    const filtered = allGames.filter(r => (r.c[2]?.v || "").includes(brand))
                             .map(r => ({ title: r.c[0]?.v, img: toLink(r.c[6]?.v), console: r.c[4]?.v, owned: r.c[14]?.v }));
    
    renderGrid(filtered);
}

function toLink(id) { 
    const m = id?.match(/id=([-\w]+)/); 
    return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800` : id; 
}

function renderGrid(items) {
    const view = document.getElementById('view-list');
    view.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'game-grid';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'game-card';
        if(item.owned === "NON") div.style.opacity = "0.3";
        div.onclick = () => {
            activeItem = item;
            const card = document.getElementById('floating-card');
            card.innerHTML = `<img src="${item.img}">`;
            card.style.display = 'block';
            card.className = 'animate-zoom';
            document.getElementById('overlay').style.display = 'block';
        };
        div.innerHTML = `<img src="${item.img}">`;
        grid.appendChild(div);
    });
    view.appendChild(grid);
}

function handleFloatingClick() {
    const detail = document.getElementById('full-detail');
    detail.innerHTML = `
        <button onclick="closeDetail()" style="position:absolute; top:20px; background:var(--brand-color); color:white; border:none; padding:15px; border-radius:10px;">✕ FERMER</button>
        <img src="${activeItem.img}" style="max-height:40%; margin-bottom:20px; border-radius:10px;">
        <h2 style="padding:0 20px; text-align:center;">${activeItem.title}</h2>
        <p><b>Console :</b> ${activeItem.console}</p>`;
    
    document.getElementById('floating-card').style.display = 'none';
    detail.style.display = 'flex';
    detail.className = 'scale-in-ver-center';
}

function closeDetail() {
    const detail = document.getElementById('full-detail');
    detail.className = 'scale-out-ver-center';
    setTimeout(() => {
        detail.style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
        // On réouvre la liste avec l'effet rideau
        document.getElementById('view-list').className = 'scale-in-ver-center';
    }, 500);
}

function closeOverlay() {
    document.getElementById('floating-card').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
