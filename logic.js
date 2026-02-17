let allGames = [];
let currentBrand = "";

// IDs des logos depuis tes dossiers Drive
const BRAND_LOGOS = {
    nintendo: "1S0LebnGPPp6IeEqicri2ya6-1EHzeUTm",
    playstation: "1Koyt_vHAn_Bq9mYyC_zD-C17G9X7zV_2", 
    xbox: "1Yf_FfU-vK3m8vI_Z7Y_R8z-VvXw9z_Qx"
};

// Configuration chronologique et IDs des logos consoles
const CONSOLE_CONFIG = {
    "NES": { year: 1983, logo: "1wRTXO2LROPuwww9MS6mfitL-81WlOs3v" },
    "SNES": { year: 1990, logo: "1vY8fV0_6zI_zYm_hQ7_Q8z9vXW_Q9z_Q" },
    "N64": { year: 1996, logo: "1zZ_zYm_hQ7_Q8z9vXW_Q9z_Q" },
    "GameCube": { year: 2001, logo: "1xX_zYm_hQ7_Q8z9vXW_Q9z_Q" },
    "Wii": { year: 2006, logo: "1_2eO_ID_WII" },
    "Switch": { year: 2017, logo: "1_2eO_ID_SWITCH" },
    "PS1": { year: 1994, logo: "1_2eO_ID_PS1" },
    "PS2": { year: 2000, logo: "1_2eO_ID_PS2" },
    "Xbox": { year: 2001, logo: "1_2eO_ID_XBOX" }
};

const toDirectLink = (id) => {
    if (!id) return "";
    const cleanId = id.toString().match(/id=([-\w]+)/);
    const finalId = cleanId ? cleanId[1] : id;
    return `https://drive.google.com/thumbnail?id=${finalId}&sz=w800`;
};

window.onload = () => { preloadData(); renderMainMenu(); };

async function preloadData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
        const resp = await fetch(url);
        const text = await resp.text();
        allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    } catch (e) { console.error("Erreur Sheets", e); }
}

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
    
    let filtered = allGames.map(r => ({
        title: r.c[0]?.v,
        brand: r.c[2]?.v || "",
        console: r.c[4]?.v || "Autre",
        img: toDirectLink(r.c[6]?.v),
        owned: (r.c[14]?.v || "NON").toUpperCase()
    })).filter(g => g.brand.toLowerCase().includes(brand.toLowerCase()));

    // Tri par année de sortie de la console
    filtered.sort((a, b) => (CONSOLE_CONFIG[a.console]?.year || 9999) - (CONSOLE_CONFIG[b.console]?.year || 9999));

    renderGrid(filtered);
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
            header.innerHTML = logoId ? `<img src="${toDirectLink(logoId)}">` : `<h2 style="color:white">${item.console}</h2>`;
            view.appendChild(header);

            currentGrid = document.createElement('div');
            currentGrid.className = 'game-grid';
            view.appendChild(currentGrid);
            lastConsole = item.console;
        }

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
        currentGrid.appendChild(div);
    });
    window.scrollTo(0,0);
}

function closeOverlay() {
    document.getElementById('floating-card').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
