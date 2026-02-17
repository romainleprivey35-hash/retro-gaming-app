let allGames = [];
const BRAND_LOGOS = {
    "Nintendo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/1024px-Nintendo.svg.png",
    "Playstation": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo_colour.svg",
    "Xbox": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/1024px-Xbox_one_logo.svg.png"
};

// Configuration basée sur ton fichier "ID DRVIE"
const CONSOLE_CONFIG = {
    "Gameboy Advance": { year: 2001, logo: "1wRTXO2LROPuwww9MS6mfitL-81WlOs3v" },
    "PS5": { year: 2020, logo: "1wRTXO2LROPuwww9MS6mfitL-81WlOs3v" }
};

const toDirectLink = (id) => {
    if (id.startsWith('http')) return id;
    return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
};

window.onload = () => { preloadData(); renderMainMenu(); };

async function preloadData() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
    const resp = await fetch(url);
    const text = await resp.text();
    allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
}

function renderMainMenu() {
    document.getElementById('ui-header').style.display = 'none';
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="menu-full">
        <div class="brand-section" onclick="selectBrand('Nintendo')"><img src="${BRAND_LOGOS.Nintendo}"></div>
        <div class="brand-section" onclick="selectBrand('Playstation')"><img src="${BRAND_LOGOS.Playstation}"></div>
        <div class="brand-section" onclick="selectBrand('Xbox')"><img src="${BRAND_LOGOS.Xbox}"></div>
    </div>`;
}

function selectBrand(brand) {
    document.getElementById('ui-header').style.display = 'block';
    document.getElementById('ui-header').innerHTML = `<button onclick="renderMainMenu()">⬅ RETOUR</button>`;
    
    let filtered = allGames.map(r => ({
        title: r.c[1]?.v,
        brand: r.c[2]?.v || "", // Colonne marque à vérifier selon ton Sheets
        console: r.c[2]?.v || "Inconnue",
        img: toDirectLink(r.c[0]?.v || ""), // Photo colonne A
        owned: r.c[5]?.v === true || r.c[5]?.v === "Dans ma collection" ? "OUI" : "NON"
    })).filter(g => g.console.includes(brand) || brand === "Nintendo"); // Ajustement filtre

    filtered.sort((a, b) => (CONSOLE_CONFIG[a.console]?.year || 9999) - (CONSOLE_CONFIG[b.console]?.year || 9999));
    renderGrid(filtered);
}

function renderGrid(items) {
    const view = document.getElementById('view-list');
    view.innerHTML = '';
    let lastConsole = "";
    let grid = null;

    items.forEach(item => {
        if (item.console !== lastConsole) {
            const header = document.createElement('div');
            header.className = 'console-logo-header';
            header.innerHTML = `<img src="${toDirectLink(CONSOLE_CONFIG[item.console]?.logo || "1wRTXO2LROPuwww9MS6mfitL-81WlOs3v")}">`;
            view.appendChild(header);
            grid = document.createElement('div');
            grid.className = 'game-grid';
            view.appendChild(grid);
            lastConsole = item.console;
        }
        const div = document.createElement('div');
        div.className = 'game-card' + (item.owned === "NON" ? ' not-owned' : '');
        div.innerHTML = `<img src="${item.img}">`;
        grid.appendChild(div);
    });
}
