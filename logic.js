let allGames = [];
let currentBrand = "";

// Transformation des liens Drive pour l'affichage
const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

// Pré-chargement des données Jeux
async function preloadData() {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        allGames = json.table.rows;
    } catch (e) { console.error("Erreur de chargement", e); }
}

// Sélection de la marque avec changement de couleur dynamique
function selectBrand(brand) {
    let color = "#333";
    if (brand.includes("Nintendo")) color = "#e60012";
    if (brand.includes("Sony") || brand.includes("Playstation")) {
        color = "#00439c";
        currentBrand = "Playstation";
    } else {
        currentBrand = brand;
    }
    if (brand.includes("Xbox")) color = "#107c10";
    
    document.documentElement.style.setProperty('--brand-color', color);
    showCategories();
}

// Menu des catégories
function showCategories() {
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="sticky-header"><button onclick="location.reload()">⬅ Retour</button></div>
        <h2 style="text-align:center; margin-top:80px; color:#333;">${currentBrand.toUpperCase()}</h2>
        <div class="game-grid">
            <div class="game-card" onclick="fetchGamesByBrand()">
                <div class="card-face card-front" style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <span style="font-size:3em;">🎮</span>
                    <b>JEUX</b>
                </div>
            </div>
            <div class="game-card" onclick="fetchConsolesByBrand()">
                <div class="card-face card-front" style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <span style="font-size:3em;">🕹️</span>
                    <b>CONSOLES</b>
                </div>
            </div>
            <div class="game-card" onclick="fetchAccessoriesByBrand()">
                <div class="card-face card-front" style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
                    <span style="font-size:3em;">🎧</span>
                    <b>ACCESSOIRES</b>
                </div>
            </div>
        </div>`;
    window.scrollTo(0,0);
}

// Liste des JEUX avec effet de rotation 3D
async function fetchGamesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px; color:#333;">JEUX ${currentBrand}</h2>`;
    
    if (allGames.length === 0) await preloadData();

    const groups = {};
    allGames.forEach(row => {
        const rowBrand = (row.c[2]?.v || "").toLowerCase();
        if (rowBrand.includes(currentBrand.toLowerCase())) {
            const cName = row.c[4]?.v || "Autre";
            if (!groups[cName]) groups[cName] = [];
            groups[cName].push({
                title: row.c[0]?.v || "",
                jaquette: toDirectLink(row.c[6]?.v),
                price: row.c[12]?.v || "0",
                owned: (row.c[14]?.v || "").includes('✅')
            });
        }
    });

    for (const cName in groups) {
        let html = `<div class="console-header"><h3>${cName}</h3></div><div class="game-grid">`;
        groups[cName].forEach(g => {
            html += `
                <div class="game-card" onclick="this.classList.toggle('flipped')" style="opacity: ${g.owned ? '1' : '0.4'}">
                    <div class="card-face card-front">
                        <img src="${g.jaquette}" class="game-jaquette" onerror="this.src='https://via.placeholder.com/150'">
                    </div>
                    <div class="card-face card-back">
                        <h3 style="font-size:0.8em; padding:5px;">${g.title}</h3>
                        <div style="font-size:1.5em; font-weight:bold; margin:10px 0;">${g.price}€</div>
                        <p style="font-size:0.7em; opacity:0.8;">${cName}</p>
                    </div>
                </div>`;
        });
        view.innerHTML += html + `</div>`;
    }
}

// Liste des CONSOLES
async function fetchConsolesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">CONSOLES</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.CONSOLES}`;
    const response = await fetch(url);
    const text = await response.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;

    let html = `<div class="game-grid">`;
    rows.forEach(row => {
        if ((row.c[3]?.v || "").toLowerCase().includes(currentBrand.toLowerCase())) {
            html += `
                <div class="game-card">
                    <div class="card-face card-front">
                        <img src="${toDirectLink(row.c[1]?.v)}" style="width:100%; height:100%; object-fit:contain; padding:10px;">
                        <div style="position:absolute; bottom:0; background:rgba(255,255,255,0.8); width:100%; text-align:center; font-size:0.7em; font-weight:bold; padding:5px;">${row.c[0]?.v}</div>
                    </div>
                </div>`;
        }
    });
    view.innerHTML += html + `</div>`;
}

// Liste des ACCESSOIRES
async function fetchAccessoriesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">ACCESSOIRES</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.ACCESSOIRES}`;
    const response = await fetch(url);
    const text = await response.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;

    let html = `<div class="game-grid">`;
    rows.forEach(row => {
        if ((row.c[5]?.v || "").toLowerCase().includes(currentBrand.toLowerCase())) {
            html += `
                <div class="game-card">
                    <div class="card-face card-front">
                        <img src="${toDirectLink(row.c[1]?.v)}" style="width:100%; height:100%; object-fit:contain; padding:10px;">
                        <div style="position:absolute; bottom:0; background:rgba(255,255,255,0.8); width:100%; text-align:center; font-size:0.7em; font-weight:bold; padding:5px;">${row.c[0]?.v}</div>
                    </div>
                </div>`;
        }
    });
    view.innerHTML += html + `</div>`;
}
