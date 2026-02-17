let allGames = [];
let currentBrand = "";
let activeGameData = null;

// --- MODIFICATION : IDENTIFIANTS IMAGES DRIVE POUR LES MARQUES ---
const BRAND_LOGOS = {
    nintendo: "1S0LebnGPPp6IeEqicri2ya6-1EHzeUTm",    // Logo Nintendo (Drive)
    playstation: "1Koyt_vHAn_Bq9mYyC_zD-C17G9X7zV_2", // Logo Playstation (Drive)
    xbox: "1Yf_FfU-vK3m8vI_Z7Y_R8z-VvXw9z_Qx"         // Logo Xbox (Drive)
};

const CONSOLE_CONFIG = {
    "NES": { year: 1983, logo: "1wRTXO2LROPuwww9MS6mfitL-81WlOs3v" },
    "SNES": { year: 1990, logo: "1vY8fV0_6zI_zYm_hQ7_Q8z9vXW_Q9z_Q" },
    "N64": { year: 1996, logo: "1zZ_zYm_hQ7_Q8z9vXW_Q9z_Q" },
    "GC": { year: 2001, logo: "1xX_zYm_hQ7_Q8z9vXW_Q9z_Q" }
};
// --- FIN DE LA MODIFICATION ---

const toDirectLink = (val) => {
    if (!val) return "";
    const match = val.toString().match(/id=([-\w]+)/);
    const id = match ? match[1] : val;
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
        img: toDirectLink(row.c[6]?.v),
        brand: row.c[2]?.v || "",
        console: row.c[4]?.v || "Autre",
        price: row.c[12]?.v,
        owned: row.c[14]?.v || "NON"
    })).filter(g => g.brand.toLowerCase().includes(brand.toLowerCase()));

    games.sort((a, b) => (CONSOLE_CONFIG[a.console]?.year || 9999) - (CONSOLE_CONFIG[b.console]?.year || 9999));

    renderGrid(games);
}

function renderGrid(items) {
    const view = document.getElementById('view-list');
    view.innerHTML = '';
    let lastConsole = "";
    let currentGrid = null;

    items.forEach(item => {
        if (item.console !== lastConsole) {
            const header = document.createElement('div');
            header.className = 'console-logo-header';
            const logoId = CONSOLE_CONFIG[item.console]?.logo;
            header.innerHTML = logoId ? `<img src="${toDirectLink(logoId)}">` : `<h2 style="color:white; padding:20px;">${item.console}</h2>`;
            view.appendChild(header);

            currentGrid = document.createElement('div');
            currentGrid.className = 'game-grid';
            view.appendChild(currentGrid);
            lastConsole = item.console;
        }

        const div = document.createElement('div');
        div.className = 'game-card' + (item.owned.toString().toUpperCase().includes('NON') ? ' not-owned' : '');
        div.onclick = () => handleCardClick(item.img, item);
        div.innerHTML = `<img src="${item.img}">`;
        currentGrid.appendChild(div);
    });
}

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
        <button onclick="closeFullDetail()" style="background:#222;color:white;border:1px solid #444;padding:15px;border-radius:50px;width:100%;margin-bottom:20px;">✕ FERMER</button>
        <img src="${activeGameData.img}" style="width:100%; border-radius:15px; margin-bottom:20px;">
        <h1 style="text-align:center; margin:0 0 20px 0;">${activeGameData.title}</h1>
        <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #222;">
            <p><b>Console :</b> ${activeGameData.console}</p>
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
