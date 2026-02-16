let allGames = [];
let currentBrand = "";

const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

async function preloadData() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        allGames = json.table.rows;
    } catch (e) { console.error("Erreur preload", e); }
}

// ÉTAPE 1 : Menu des Marques (Déjà géré par la navbar, mais on prépare la suite)
function selectBrand(brand) {
    currentBrand = brand;
    showCategories();
}

// ÉTAPE 2 : Menu des Catégories (Mode Cartes)
function showCategories() {
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="sticky-header"><button onclick="location.reload()">⬅ Retour</button></div>
        <h2 style="text-align:center; margin-top:80px;">${currentBrand.toUpperCase()}</h2>
        <div class="game-grid">
            <div class="game-card" onclick="fetchGamesByBrand('${currentBrand}')">
                <div class="category-icon">🎮</div>
                <div class="game-info"><b>JEUX</b></div>
            </div>
            <div class="game-card" onclick="fetchConsolesByBrand('${currentBrand}')">
                <div class="category-icon">🕹️</div>
                <div class="game-info"><b>CONSOLES</b></div>
            </div>
            <div class="game-card" onclick="fetchAccessoriesByBrand('${currentBrand}')">
                <div class="category-icon">🎧</div>
                <div class="game-info"><b>ACCESSOIRES</b></div>
            </div>
        </div>
    `;
    window.scrollTo(0,0);
}

// ÉTAPE 3 : Affichage des JEUX (Classés par consoles)
async function fetchGamesByBrand(brand) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">JEUX ${brand}</h2>`;
    
    if (allGames.length === 0) await preloadData();

    const groups = {};
    allGames.forEach(row => {
        const b = row.c[2]?.v || "";
        if (b.toLowerCase().includes(brand.toLowerCase())) {
            const cName = row.c[4]?.v || "Autre";
            if (!groups[cName]) groups[cName] = [];
            groups[cName].push({
                title: row.c[0]?.v || "",
                jaquette: toDirectLink(row.c[6]?.v),
                price: row.c[12]?.v || "0",
                isOwned: row.c[14]?.v || "",
                logoTitre: toDirectLink(row.c[1]?.v),
                keyArt: toDirectLink(row.c[5]?.v),
                console: cName
            });
        }
    });

    let html = "";
    for (const consoleName in groups) {
        html += `<div class="console-header"><h3>${consoleName}</h3></div><div class="game-grid">`;
        groups[consoleName].forEach(g => {
            const data = btoa(unescape(encodeURIComponent(JSON.stringify(g))));
            html += `<div class="game-card" style="opacity:${g.isOwned.includes('❌') ? '0.3':'1'}" onclick="openGameDetail('${data}')">
                <img src="${g.jaquette}" class="game-jaquette"><div class="game-info"><b>${g.title}</b></div></div>`;
        });
        html += `</div>`;
    }
    view.innerHTML += html;
}

// ÉTAPE 3 : Affichage des CONSOLES (Liste par marque)
async function fetchConsolesByBrand(brand) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">CONSOLES ${brand}</h2>`;
    
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.CONSOLES}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;

    let html = `<div class="game-grid">`;
    rows.forEach(row => {
        const name = row.c[0]?.v || "";
        const rowBrand = row.c[3]?.v || ""; // ON SUPPOSE QUE LA MARQUE EST EN COLONNE D (3)
        if (rowBrand.toLowerCase().includes(brand.toLowerCase())) {
            const img = toDirectLink(row.c[1]?.v);
            html += `<div class="game-card"><img src="${img}" class="game-jaquette" style="object-fit:contain;padding:10px;"><div class="game-info"><b>${name}</b></div></div>`;
        }
    });
    view.innerHTML += html + `</div>`;
}

// ÉTAPE 3 : Affichage des ACCESSOIRES (Liste par marque)
async function fetchAccessoriesByBrand(brand) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">ACCESSOIRES ${brand}</h2>`;
    
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.ACCESSOIRES}`;
    
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;

        let html = `<div class="game-grid">`;
        rows.forEach(row => {
            const name = row.c[0]?.v || "";               // Colonne A : Nom
            const imgAccessoire = toDirectLink(row.c[1]?.v); // Colonne B : Image Accessoire
            const consoleName = row.c[2]?.v || "";        // Colonne C : Nom de la console
            const imgConsole = toDirectLink(row.c[3]?.v);   // Colonne D (ou E) : Image Console
            const rowBrand = row.c[5]?.v || "";           // Colonne F : CONSTRUCTEUR (Le filtre !)
            
            // On utilise la colonne F pour filtrer par marque
            if (rowBrand.toLowerCase().includes(brand.toLowerCase())) {
                html += `
                    <div class="game-card">
                        <img src="${imgAccessoire}" class="game-jaquette" style="object-fit:contain;padding:10px;">
                        <div class="game-info">
                            <b>${name}</b>
                            <p style="font-size:0.8em; color:#888; margin:5px 0;">${consoleName}</p>
                            <div style="margin-top:5px;">
                                <img src="${imgConsole}" style="height:30px; object-fit:contain; opacity:0.9;" title="${consoleName}">
                            </div>
                        </div>
                    </div>`;
            }
        });
        view.innerHTML += html + `</div>`;
    } catch (e) {
        view.innerHTML += "<p style='text-align:center;color:red;'>Erreur : Vérifie bien ton onglet 'Accessoires'.</p>";
    }
}

// Les fonctions openGameDetail restent identiques...
function openGameDetail(encoded) {
    const g = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    const div = document.createElement('div');
    div.className = "full-page-detail"; div.id = "active-detail";
    div.innerHTML = `
        <button class="close-detail-btn" onclick="document.getElementById('active-detail').remove()">✕ Fermer</button>
        <img src="${g.keyArt || g.jaquette}" class="key-art-img">
        <img src="${g.logoTitre}" class="title-logo-img">
        <div class="detail-content"><h1>${g.title}</h1><p>${g.console}</p><div class="price-tag">${g.price}€</div></div>`;
    document.body.appendChild(div);
}
