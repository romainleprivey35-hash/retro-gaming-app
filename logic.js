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

// 3. CONFIGURATION DES CONSOLES (COLONNE E)
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

// Fonction universelle : Elle prend n'importe quel texte et en extrait l'ID Drive
function toDirectLink(val) {
    if (!val) return "";
    const str = val.toString();
    const match = str.match(/[-\w]{25,}/); // Extrait l'ID pour le thumbnail
    return match ? `https://drive.google.com/thumbnail?id=${match[0]}&sz=w800` : "";
}
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

        let colTitle, colBrand, colPhoto, colOwned, colConsole;

        // INDEX SUR MESURE (Vérifiés avec tes listes)
        if (category === "Jeux") {
            colTitle = 0; colBrand = 1; colPhoto = 6; colOwned = 14; colConsole = 4; // Console en E
        } 
        else if (category === "Consoles") {
            colTitle = 0; colBrand = 1; colPhoto = 6; colOwned = 10; colConsole = 0; // Nom en A
        } 
        else if (category === "Accessoires") {
            colTitle = 0; colBrand = 1; colPhoto = 2; colOwned = 14; colConsole = 3; // Console associée en D
        }

        const items = rows.map(row => {
            if (!row.c || !row.c[colTitle]) return null;
            
            const rawOwned = row.c[colOwned]?.v;
            const isOwned = rawOwned ? rawOwned.toString().toUpperCase().trim().includes("OUI") : false;

            return {
                title: row.c[colTitle]?.v || "Sans titre",
                brand: row.c[colBrand]?.v || "",
                consoleName: row.c[colConsole]?.v || category,
                img: toDirectLink(row.c[colPhoto]?.v),
                owned: isOwned 
            };
        }).filter(item => 
            item && item.brand && item.brand.toString().toLowerCase().trim() === currentBrand.toLowerCase().trim()
        );

        // On appelle la fonction qui est définie plus bas
        renderGrid(items);
        
        // On remet le bouton retour
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
            
            // --- LA LIGNE CRITIQUE ---
            // On vérifie si logoNom existe dans les données envoyées par Google
            let logoId = item.logoNom || null;
            
            if (logoId && typeof toDirectLink === 'function') {
                // Si on a un ID, on affiche l'image
                header.innerHTML = `<img src="${toDirectLink(logoId)}" style="max-height: 80px; margin: 25px 0;">`;
            } else {
                // Sinon, on affiche le texte
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
        
        div.onclick = () => {
            if (typeof handleCardClick === 'function') {
                handleCardClick(item.img, item);
            }
        };

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
            <p><b>Prix :</b> ${activeGameData.price}€</p>
            <p><b>Possédé :</b> ${activeGameData.owned}</p>
        </div>`;
    detail.style.display = 'block';
    // ON FIGE LE FOND ICI
    document.body.style.overflow = 'hidden';
}

function closeOverlay() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('floating-card').style.display = 'none';
    document.getElementById('full-detail').style.display = 'none'; // Sécurité : on ferme tout
    
    // TRÈS IMPORTANT : On libère le scroll ici aussi !
    document.body.style.overflow = 'auto';
}

function closeFullDetail() {
    document.getElementById('full-detail').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
    // ON REDONNE LE SCROLL ICI
    document.body.style.overflow = 'auto';
}    
