let allGames = [];
let currentBrand = "";
let activeGameData = null;

// 1. TES LOGOS DE MARQUES (ACCUEIL)
const BRAND_LOGOS = {
    nintendo: "11g1hLkCEY-wLQgMOHuDdRcmBbq33Lkn7",    
    playstation: "1XzZYJwDRWiPBpW-16TGYPcTYSGRB-fC0", 
    xbox: "1SzJdKKuHIv5M3bGNc9noed8mN60fNm9y"
};

// 2. TES LOGOS DE CATEGORIES (PAR MARQUE)
const CATEGORY_LOGOS = {
    "Nintendo": {
        "Consoles": "1ZWCtVvA7pIqRBcB_c97vZoDa5RL3zrV-",
        "Jeux": "1_vATwWlWWhOdJaThbOxP2UUjZmp8JYi_",
        "Accessoires": "1F0zl-wLOAzQDbrVKh0tmD5SF2aiUw9sf"
    },
    "Playstation": {
        "Consoles": "1qXh9SSZvVo-l4xrBhPhD3Y6Yxom2dDiA",
        "Jeux": "1BtsLW7vn-EGYcVt2Y8IG3BCCI2V2pxxn",
        "Accessoires": "1FtEw-zApC0N7jgVlDt5sljjDvhi3ry33"
    },
    "Xbox": {
        "Consoles": "1xjx-ISS_pNzgnmRLduIi10ZatejSYDlt",
        "Jeux": "1rQoTz-myIpesCFQp952WTJeTPqR-92Tg",
        "Accessoires": "1aL29YXaRHYb5EuaY7LjLkBlFP3djq8-U"
    }
};

// 3. CONFIGURATION DES CONSOLES
const CONSOLE_CONFIG = {
    "GB": { year: 1989, logo: "1XEkPuCr2mmIvpsmjmpkrG1XumS-24wLb" },
    "PS1": { year: 1994, logo: "1DV-N37sM1AA-fl5rYe1_Urr6hh9e6eTF" },
    "N64": { year: 1996, logo: "1iumJt5i-5Jd85ZPZLr3NR44hbhdohUh5" },
    "GBC": { year: 1998, logo: "1dek_9N4wDwFBhSYmUoij7OhtFfCc4hcQ" },
    "PS2": { year: 2000, logo: "10h2eIupplXfFBvQQNWRptu1EC3xTkghc" },
    "GBA": { year: 2001, logo: "11vgmA2xIMxNHbbYMcUIwXTNgt0BVKacp" },
    "Xbox": { year: 2001, logo: "15i7MRlq_QVyKUsQKWsFfMSkvqALFwb2I" },
    "GameCube": { year: 2002, logo: "1SW-jXEJnlZ4nh3jXg3IVkNGK7QzZMSze" },
    "DS": { year: 2004, logo: "1Gals-7-g_lNxOBult4FihHYiv2nKgkfP" },
    "PSP": { year: 2004, logo: "1zOJp5Yh0JRHhI-o4PfyFTdX_OH7j3Bmo" },
    "WII": { year: 2006, logo: "1aAx82c4LPWz6U-JQ2jXf3fG0hwAOG_Bc" },
    "PS3": { year: 2006, logo: "1eqVPNUIqNwzdPs4j6ALB922qNvSJozFA" },
    "PS4": { year: 2013, logo: "1VjijUcf3nyaclZazZT8akg_4Ifo0UjGM" },
    "PS5": { year: 2020, logo: "1F_qvq4AM8uvx1nKaRUdPWh5r1mjVqic8" }
};

function toDirectLink(val) {
    if (!val) return "";
    const str = val.toString();
    const match = str.match(/[-\w]{25,}/); 
    return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w800` : "";
}

async function preloadData() {
    const sheetId = "1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=Jeux`;
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    } catch(e) { console.error("Erreur preload:", e); }
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
    
    const categories = ["Consoles", "Jeux", "Accessoires"];
    const view = document.getElementById('view-list');
    
    view.innerHTML = `
        <div class="menu-full">
            ${categories.map(cat => `
                <div class="brand-section" onclick="renderCategory('${cat}')">
                    <img src="${toDirectLink(CATEGORY_LOGOS[brand][cat])}">
                </div>
            `).join('')}
        </div>`;
}

async function renderCategory(category) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<h2 style="color:white; text-align:center; margin-top:100px;">Chargement...</h2>`;

    const sheetId = "1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(category)}`;

    try {
        const resp = await fetch(url);
        const text = await resp.text();
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;

        let colTitle, colBrand, colPhoto, colOwned, colConsole, colLogoNom;

        // INDEXATION STRICTE BASÉE SUR TON SHEET
        if (category === "Jeux") {
            colTitle = 0; colBrand = 1; colLogoNom = 2; colConsole = 4; colPhoto = 7; colOwned = 10; 
        } 
        else if (category === "Consoles") {
            colTitle = 1; colBrand = 2; colLogoNom = 2; colConsole = 1; colPhoto = 0; colOwned = 10; 
        } 
        else if (category === "Accessoires") {
            colTitle = 0; colBrand = 2; colLogoNom = 6; colConsole = 4; colPhoto = 1; colOwned = 10;
        }

        const items = rows.map(row => {
            if (!row.c || !row.c[colTitle]) return null;
            
            const rawOwned = row.c[colOwned]?.v;
            const isOwned = rawOwned ? rawOwned.toString().toUpperCase().trim().includes("OUI") : false;

            return {
                title: row.c[colTitle]?.v || "Sans titre",
                brand: row.c[colBrand]?.v || "",
                consoleName: row.c[colConsole]?.v || category,
                logoNom: row.c[colLogoNom]?.v || "", // RÉCUPÈRE L'ID DU LOGO
                img: toDirectLink(row.c[colPhoto]?.v),
                owned: isOwned 
            };
        }).filter(item => 
            item && item.brand && item.brand.toString().toLowerCase().trim() === currentBrand.toLowerCase().trim()
        );

        renderGrid(items);
        
        const headerUI = document.getElementById('ui-header');
        if(headerUI) headerUI.innerHTML = `<button onclick="selectBrand('${currentBrand}')">⬅ RETOUR</button>`;

    } catch (error) {
        console.error(error);
        view.innerHTML = `<h2 style="color:white; text-align:center;">Erreur de chargement</h2>`;
    }
}

function renderGrid(items) {
    const view = document.getElementById('view-list');
    if (!view) return; 
    
    view.innerHTML = '';
    let lastConsole = ""; 
    let currentGrid = null;

    if (!items || items.length === 0) {
        view.innerHTML = `<h2 style="color:white; text-align:center; margin-top:100px;">Aucun objet trouvé</h2>`;
        return;
    }

    items.forEach(item => {
        const name = item.consoleName ? item.consoleName.toString().trim() : "Autre";
        
        if (name.toUpperCase() !== lastConsole.toUpperCase()) {
            const header = document.createElement('div');
            header.className = 'console-logo-header';
            
            let logoId = item.logoNom;
            
            // Affiche l'image si l'ID existe, sinon affiche le nom en texte
            if (logoId && logoId !== "") {
                header.innerHTML = `<img src="${toDirectLink(logoId)}" style="max-height: 80px; margin: 25px 0;">`;
            } else {
                header.innerHTML = `<h2 style="color:white; font-size: 24px; padding: 20px;">${name}</h2>`;
            }
            
            view.appendChild(header);

            currentGrid = document.createElement('div');
            currentGrid.className = 'game-grid';
            view.appendChild(currentGrid);
            
            lastConsole = name; 
        }

        const div = document.createElement('div');
        div.className = 'game-card' + (!item.owned ? ' not-owned' : '');
        div.onclick = () => { if (typeof handleCardClick === 'function') handleCardClick(item.img, item); };
        div.innerHTML = `<img src="${item.img}" onerror="this.src='https://via.placeholder.com/150?text=Image+Manquante'">`;
        
        if (currentGrid) {
            currentGrid.appendChild(div);
        }
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
    document.body.style.overflow = 'hidden';
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
            <p><b>Possédé :</b> ${activeGameData.owned ? "OUI" : "NON"}</p>
        </div>`;
    detail.style.display = 'block';
    document.body.style.overflow = 'hidden';
}
