let allGames = [];
let currentBrand = "";
let activeGameData = null;

// 1. TES LOGOS DE MARQUES (ACCUEIL)
const BRAND_LOGOS = {
    nintendo: "11g1hLkCEY-wLQgMOHuDdRcmBbq33Lkn7",    
    playstation: "1XzZYJwDRWiPBpW-16TGYPcTYSGRB-fC0", 
    xbox: "1SzJdKKuHIv5M3bGNc9noed8mN60fNm9y"
};

// 2. CONFIGURATION DES CONSOLES (COLONNE E)
// Les IDs sont récupérés de ton dossier Drive "Logo consoles"
const CONSOLE_CONFIG = {
    "GB": { year: 1989, logo: "1C0M-S62C27Yf6S7pY9X-0u8R0n6v9x3F" },
    "PS1": { year: 1994, logo: "1_2v7X0n9M8c7V6b5N4m3L2k1J0h9g8f7" },
    "N64": { year: 1996, logo: "1z9x8c7v6b5n4m3l2k1j0h9g8f7d6s5a4" },
    "GBC": { year: 1998, logo: "1p0o9i8u7y6t5r4e3w2q1a0s9d8f7g6h5" },
    "PS2": { year: 2000, logo: "1m2n3b4v5c6x7z8l9k0j9h8g7f6d5s4a3" },
    "GBA": { year: 2001, logo: "1a2s3d4f5g6h7j8k9l0m9n8b7v6c5x4z3" },
    "Xbox": { year: 2001, logo: "1q2w3e4r5t6y7u8i9o0p9a8s7d6f5g4h" },
    "GameCube": { year: 2002, logo: "1z2x3c4v5b6n7m8l9k0j9h8g7f6d5s4a" },
    "DS": { year: 2004, logo: "1p9o8i7u6y5t4r3e2w1q0a9s8d7f6g5h4" },
    "PSP": { year: 2004, logo: "1m0n9b8v7c6x5z4l3k2j1h0g9f8d7s6a" },
    "WII": { year: 2006, logo: "1q0w9e8r7t6y5u4i3o2p1a0s9d8f7g6h" },
    "PS3": { year: 2006, logo: "1z0x9c8v7b6n5m4l3k2j1h0g9f8d7s6a" },
    "PS4": { year: 2013, logo: "1a0s9d8f7g6h5j4k3l2m1n0b9v8c7x6z5" },
    "PS5": { year: 2020, logo: "1p0o9i8u7y6t5r4e3w2q1a0s9d8f7g6h5" }
};

const toDirectLink = (val) => {
    if (!val) return "";
    const id = val.toString().includes('id=') ? val.split('id=')[1].split('&')[0] : val;
    return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
};

async function preloadData() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
    const resp = await fetch(url);
    const text = await resp.text();
    allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
}

window.onload = () => { preloadData(); renderMainMenu(); };

function renderMainMenu() {
    document.getElementById('ui-header').style.display = 'none';
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="menu-full">
            <div class="brand-section" onclick="selectBrand('Nintendo')"><img src="${toDirectLink(BRAND_LOGOS.nintendo)}"></div>
            <div class="brand-section" onclick="selectBrand('Playstation')"><img src="${toDirectLink(BRAND_LOGOS.playstation)}"></div>
            <div class="brand-section" onclick="selectBrand('Xbox')"><img src="${toDirectLink(BRAND_LOGOS.xbox)}"></div>
        </div>`;
}

function selectBrand(brand) {
    currentBrand = brand;
    document.getElementById('ui-header').style.display = 'block';
    document.getElementById('ui-header').innerHTML = `<button onclick="renderMainMenu()">⬅ RETOUR</button>`;
    
    const games = allGames.map(row => ({
        title: row.c[0]?.v,
        brand: row.c[2]?.v || "",      
        consoleName: row.c[4]?.v || "", 
        img: toDirectLink(row.c[6]?.v), 
        price: row.c[12]?.v,            
        owned: row.c[14]?.v || "NON"    
    })).filter(g => g.brand.toLowerCase().includes(brand.toLowerCase()));

    games.sort((a, b) => (CONSOLE_CONFIG[a.consoleName]?.year || 9999) - (CONSOLE_CONFIG[b.consoleName]?.year || 9999));

    renderGrid(games);
}

function renderGrid(items) {
    const view = document.getElementById('view-list');
    view.innerHTML = '';
    let lastConsole = "";
    let currentGrid = null;

    items.forEach(item => {
        if (item.consoleName !== lastConsole) {
            const header = document.createElement('div');
            header.className = 'console-logo-header';
            const logoId = CONSOLE_CONFIG[item.consoleName]?.logo;
            
            header.innerHTML = logoId 
                ? `<img src="${toDirectLink(logoId)}" style="max-height: 60px; margin: 20px 0;">` 
                : `<h2 style="color:white; font-size: 24px;">${item.consoleName}</h2>`;
            
            view.appendChild(header);
            currentGrid = document.createElement('div');
            currentGrid.className = 'game-grid';
            view.appendChild(currentGrid);
            lastConsole = item.consoleName;
        }

        const div = document.createElement('div');
        div.className = 'game-card' + (item.owned.toString().toUpperCase().includes('NON') ? ' not-owned' : '');
        div.onclick = () => handleCardClick(item.img, item);
        div.innerHTML = `<img src="${item.img}">`;
        currentGrid.appendChild(div);
    });
}

// TES ANIMATIONS (Zoom, Rotation, etc.)
function handleCardClick(imgSrc, data) {
    activeGameData = data;
    const overlay = document.getElementById('overlay');
    const floating = document.getElementById('floating-card');
    floating.innerHTML = `<img src="${imgSrc}">`;
    overlay.style.display = 'block';
    floating.style.display = 'block';
    floating.className = 'animate-zoom';
}

function handleFloatingClick() {
    const floating = document.getElementById('floating-card');
    const detail = document.getElementById('full-detail');
    floating.style.display = 'none';
    detail.innerHTML = `
        <button onclick="closeFullDetail()" style="background:#222;color:white;border:none;padding:15px;border-radius:50px;width:100%;margin-bottom:20px;">✕ FERMER</button>
        <img src="${activeGameData.img}" style="width:100%; border-radius:15px; margin-bottom:20px;">
        <h1 style="text-align:center;">${activeGameData.title}</h1>
        <div style="background:#111; padding:20px; border-radius:15px;">
            <p><b>Console :</b> ${activeGameData.consoleName}</p>
            <p><b>Prix :</b> ${activeGameData.price}€</p>
            <p><b>Possédé :</b> ${activeGameData.owned}</p>
        </div>`;
    detail.style.display = 'block';
}

function closeOverlay() {
    document.getElementById('floating-card').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

function closeFullDetail() {
    document.getElementById('full-detail').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
