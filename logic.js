let allGames = [];
let currentBrand = "";

// TA FONCTION D'ORIGINE (Celle qui marchait pour les images)
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

// NAVIGATION (Ne pas changer)
function selectBrand(brand) {
    currentBrand = brand;
    showCategories();
}

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
        </div>`;
    window.scrollTo(0,0);
}

// JEUX
async function fetchGamesByBrand(brand) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">JEUX ${brand}</h2>`;
    if (allGames.length === 0) await preloadData();
    const groups = {};
    allGames.forEach(row => {
        if ((row.c[2]?.v || "").toLowerCase().includes(brand.toLowerCase())) {
            const c = row.c[4]?.v || "Autre";
            if (!groups[c]) groups[c] = [];
            groups[c].push({
                title: row.c[0]?.v || "",
                jaquette: toDirectLink(row.c[6]?.v),
                isOwned: row.c[14]?.v || ""
            });
        }
    });
    let html = "";
    for (const c in groups) {
        html += `<div class="console-header"><h3>${c}</h3></div><div class="game-grid">`;
        groups[c].forEach(g => {
            html += `<div class="game-card" style="opacity:${g.isOwned.includes('❌') ? '0.3':'1'}">
                <img src="${g.jaquette}" class="game-jaquette"><div class="game-info"><b>${g.title}</b></div></div>`;
        });
        html += `</div>`;
    }
    view.innerHTML += html;
}

// CONSOLES
async function fetchConsolesByBrand(brand) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">CONSOLES ${brand}</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.CONSOLES}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    let html = `<div class="game-grid">`;
    rows.forEach(row => {
        if ((row.c[3]?.v || "").toLowerCase().includes(brand.toLowerCase())) {
            html += `<div class="game-card"><img src="${toDirectLink(row.c[1]?.v)}" class="game-jaquette" style="object-fit:contain;padding:10px;"><div class="game-info"><b>${row.c[0]?.v}</b></div></div>`;
        }
    });
    view.innerHTML += html + `</div>`;
}

// ACCESSOIRES (Ajouté proprement sans toucher au reste)
async function fetchAccessoriesByBrand(brand) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">ACCESSOIRES ${brand}</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.ACCESSOIRES}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    let html = `<div class="game-grid">`;
    rows.forEach(row => {
        const rowBrand = row.c[5]?.v || ""; // Colonne F
        if (rowBrand.toLowerCase().includes(brand.toLowerCase())) {
            html += `
                <div class="game-card">
                    <img src="${toDirectLink(row.c[1]?.v)}" class="game-jaquette" style="object-fit:contain;padding:10px;">
                    <div class="game-info">
                        <b>${row.c[0]?.v}</b>
                        <p style="font-size:0.7em; color:#888;">${row.c[2]?.v}</p>
                        <img src="${toDirectLink(row.c[3]?.v)}" style="height:20px; object-fit:contain; margin-top:5px;">
                    </div>
                </div>`;
        }
    });
    view.innerHTML += html + `</div>`;
}
