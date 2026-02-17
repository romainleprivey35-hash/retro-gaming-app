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
// IDs récupérés directement de tes liens Drive
const CONSOLE_CONFIG = {
    "GB": { year: 1989, logo: "1XEkPuCr2mmIvpsmjmpkrG1XumS-24wLb" }, // Game Boy (OriginalDMG) [cite: 11]
    "PS1": { year: 1994, logo: "1DV-N37sM1AA-fl5rYe1_Urr6hh9e6eTF" }, // PlayStation 1 (PS1 FAT) [cite: 5]
    "N64": { year: 1996, logo: "1iumJt5i-5Jd85ZPZLr3NR44hbhdohUh5" }, // Nintendo 64 [cite: 15]
    "GBC": { year: 1998, logo: "1dek_9N4wDwFBhSYmUoij7OhtFfCc4hcQ" }, // Game Boy Color [cite: 13]
    "PS2": { year: 2000, logo: "10h2eIupplXfFBvQQNWRptu1EC3xTkghc" }, // PlayStation 2 (PS2 FAT) [cite: 1]
    "GBA": { year: 2001, logo: "11vgmA2xIMxNHbbYMcUIwXTNgt0BVKacp" }, // Game Boy Advance [cite: 2]
    "Xbox": { year: 2001, logo: "15i7MRlq_QVyKUsQKWsFfMSkvqALFwb2I" }, // Xbox (Première Gén.) [cite: 4]
    "GameCube": { year: 2002, logo: "1SW-jXEJnlZ4nh3jXg3IVkNGK7QzZMSze" }, // Nintendo GameCube [cite: 9]
    "DS": { year: 2004, logo: "1Gals-7-g_lNxOBult4FihHYiv2nKgkfP" }, // Nintendo DS Lite [cite: 7]
    "PSP": { year: 2004, logo: "1zOJp5Yh0JRHhI-o4PfyFTdX_OH7j3Bmo" }, // PSP 3004 [cite: 17]
    "WII": { year: 2006, logo: "1aAx82c4LPWz6U-JQ2jXf3fG0hwAOG_Bc" }, // Wii [cite: 12]
    "PS3": { year: 2006, logo: "1eqVPNUIqNwzdPs4j6ALB922qNvSJozFA" }, // PlayStation 3 (PS3 FAT) [cite: 14]
    "PS4": { year: 2013, logo: "1VjijUcf3nyaclZazZT8akg_4Ifo0UjGM" }, // PlayStation 4 (PS4 FAT) [cite: 10]
    "PS5": { year: 2020, logo: "1F_qvq4AM8uvx1nKaRUdPWh5r1mjVqic8" }  // Playstation 5 (PS5 FAT) [cite: 6]
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
                ? `<img src="${toDirectLink(logoId)}" style="max-height: 80px; margin: 25px 0;">` 
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
