let allGames = [];
let currentBrand = "";
let activeGameData = null;

// IDs des logos Marques et Consoles
const BRAND_LOGOS = {
    nintendo: "1S0LebnGPPp6IeEqicri2ya6-1EHzeUTm",
    playstation: "1Koyt_vHAn_Bq9mYyC_zD-C17G9X7zV_2", 
    xbox: "1Yf_FfU-vK3m8vI_Z7Y_R8z-VvXw9z_Qx"
};

const CONSOLE_CONFIG = {
    "NES": { year: 1983, logo: "1wRTXO2LROPuwww9MS6mfitL-81WlOs3v" },
    "SNES": { year: 1990, logo: "1vY8fV0_6zI_zYm_hQ7_Q8z9vXW_Q9z_Q" },
    "N64": { year: 1996, logo: "1zZ_zYm_hQ7_Q8z9vXW_Q9z_Q" },
    "GC": { year: 2001, logo: "1xX_zYm_hQ7_Q8z9vXW_Q9z_Q" },
    "Wii": { year: 2006, logo: "ID_DRIVE_WII" },
    "Switch": { year: 2017, logo: "ID_DRIVE_SWITCH" }
};

const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    const id = match ? match[1] : val;
    return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
};

// TA STRUCTURE DE BASE
async function preloadData() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
    const resp = await fetch(url);
    const text = await resp.text();
    allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
}

window.onload = () => { preloadData(); renderMainMenu(); };

// TON MENU AVEC TES LOGOS
function renderMainMenu() {
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
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div id="overlay" onclick="closeOverlay()"></div>
        <div id="floating-card" onclick="event.stopPropagation(); handleFloatingClick()"></div>
        <div id="full-detail"></div>
        <div class="sticky-header"><button onclick="renderMainMenu()">⬅ Retour</button></div>
        <div id="grid-container"></div>`;
    
    fetchGamesByBrand();
}

async function fetchGamesByBrand() {
    const container = document.getElementById('grid-container');
    if (allGames.length === 0) await preloadData();
    
    const games = [];
    allGames.forEach(row => {
        if ((row.c[2]?.v || "").toLowerCase().includes(currentBrand.toLowerCase())) {
            games.push({ 
                title: row.c[0]?.v, 
                img: toDirectLink(row.c[6]?.v), 
                price: row.c[12]?.v, 
                owned: row.c[14]?.v || "NON", 
                console: row.c[4]?.v || "Autre" 
            });
        }
    });

    // TRI CHRONOLOGIQUE
    games.sort((a, b) => (CONSOLE_CONFIG[a.console]?.year || 9999) - (CONSOLE_CONFIG[b.console]?.year || 9999));

    // Rendu par groupes
    const groups = {};
    games.forEach(g => {
        if (!groups[g.console]) groups[g.console] = [];
        groups[g.console].push(g);
    });

    renderGrid(groups, container);
}

function renderGrid(groups, view) {
    for (const c in groups) {
        // HEADER LOGO CONSOLE
        const header = document.createElement('div');
        header.className = 'console-logo-header';
        const logoId = CONSOLE_CONFIG[c]?.logo;
        header.innerHTML = logoId ? `<img src="${toDirectLink(logoId)}">` : `<h2 style="color:white; text-align:center">${c}</h2>`;
        view.appendChild(header);

        const grid = document.createElement('div'); 
        grid.className = 'game-grid';
        groups[c].forEach(g => {
            const card = document.createElement('div'); 
            card.className = 'game-card' + (g.owned.toString().toUpperCase().includes('NON') ? ' not-owned' : '');
            card.onclick = () => handleCardClick(g.img, g);
            card.innerHTML = `<img src="${g.img}">`;
            grid.appendChild(card);
        });
        view.appendChild(grid);
    }
}

// TES FONCTIONS D'ANIMATION ORIGINALES (INTACTES)
function handleCardClick(imgSrc, data) {
    activeGameData = data;
    const overlay = document.getElementById('overlay');
    const floating = document.getElementById('floating-card');
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
            <button onclick="closeFullDetail()" style="background:#333;color:white;border:none;padding:15px;border-radius:10px;width:100%;font-weight:bold;margin-bottom:20px;">✕ FERMER</button>
            <img src="${activeGameData.img}" style="width:100%; max-height:250px; object-fit:contain; margin-bottom:20px;">
            <h1 style="text-align:center;">${activeGameData.title}</h1>
            <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #222;">
                <p><b>Console :</b> ${activeGameData.console}</p>
                <p><b>Prix :</b> ${activeGameData.price}€</p>
                <p><b>Achat :</b> ${activeGameData.owned}</p>
            </div>`;
        floating.style.display = 'none';
        detail.style.display = 'block';
    }, 300);
}

function closeOverlay() {
    const floating = document.getElementById('floating-card');
    const overlay = document.getElementById('overlay');
    floating.style.display = 'none';
    overlay.style.display = 'none';
}

function closeFullDetail() {
    document.getElementById('full-detail').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
