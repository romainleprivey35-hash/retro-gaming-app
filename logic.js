let allGames = [];
let currentBrand = "";

const LOGOS = {
    nintendo: "https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg",
    playstation: "https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg",
    xbox: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg"
};

const toDirectLink = (val) => {
    if (!val) return "";
    const match = val.match(/id=([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

window.onload = () => { preloadData(); renderMainMenu(); };

async function preloadData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
        const resp = await fetch(url);
        const text = await resp.text();
        allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    } catch (e) { console.error(e); }
}

function renderMainMenu() {
    document.getElementById('ui-header').style.display = 'none';
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="menu-full">
            <div class="brand-section nintendo-bg" onclick="selectBrand('Nintendo')">
                <img src="${LOGOS.nintendo}" alt="Nintendo">
            </div>
            <div class="brand-section playstation-bg" onclick="selectBrand('Playstation')">
                <img src="${LOGOS.playstation}" alt="Playstation">
            </div>
            <div class="brand-section xbox-bg" onclick="selectBrand('Xbox')">
                <img src="${LOGOS.xbox}" alt="Xbox">
            </div>
        </div>`;
}

function selectBrand(brand) {
    currentBrand = brand;
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').style.display = 'block';
    document.getElementById('ui-header').innerHTML = `<button onclick="renderMainMenu()">⬅ RETOUR</button>`;
    
    // Filtrage et Rendu (On garde ta logique de groupes par console)
    const filtered = allGames.map(r => ({
        title: r.c[0]?.v,
        brand: r.c[2]?.v || "",
        console: r.c[4]?.v || "Autre",
        img: toDirectLink(r.c[6]?.v),
        owned: (r.c[14]?.v || "NON").toUpperCase()
    })).filter(g => g.brand.toLowerCase().includes(brand.toLowerCase()));

    renderGrid(filtered);
}

function renderGrid(items) {
    const view = document.getElementById('view-list');
    view.innerHTML = '<div class="game-grid"></div>';
    const grid = view.querySelector('.game-grid');
    
    // Tri simple par console pour le moment (on fera les logos de consoles à l'étape 2)
    items.sort((a, b) => a.console.localeCompare(b.console));

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'game-card' + (item.owned === "NON" ? ' not-owned' : '');
        div.onclick = () => {
            const card = document.getElementById('floating-card');
            card.innerHTML = `<img src="${item.img}">`;
            card.style.display = 'block';
            card.className = 'animate-zoom';
            document.getElementById('overlay').style.display = 'block';
        };
        div.innerHTML = `<img src="${item.img}">`;
        grid.appendChild(div);
    });
}

function closeOverlay() {
    document.getElementById('floating-card').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
