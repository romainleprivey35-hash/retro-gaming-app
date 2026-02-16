let allGames = [];
let currentBrand = "";

// FONCTION CRUCIALE : Transformation des liens Drive pour l'affichage
const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    // Cette regex extrait l'ID du fichier peu importe le format du lien Drive
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
    return val; // Retourne le lien tel quel si ce n'est pas du Drive
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
        </div>
    `;
    window.scrollTo(0,0);
}

// AFFICHAGE DES JEUX
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
                jaquette: toDirectLink(row.c[6]?.v), // Colonne G
                logoTitre: toDirectLink(row.c[1]?.v), // Colonne B
                keyArt: toDirectLink(row.c[5]?.v), // Colonne F
                price: row.c[12]?.v || "0",
                isOwned: row.c[14]?.v || "",
                console: cName
            });
        }
    });

    let html = "";
    for (const c in groups) {
        html += `<div class="console-header"><h3>${c}</h3></div><div class="game-grid">`;
        groups[c].forEach(g => {
            const data = btoa(unescape(encodeURIComponent(JSON.stringify(g))));
            html += `<div class="game-card" style="opacity:${g.isOwned.includes('❌') ? '0.3':'1'}" onclick="openGameDetail('${data}')">
                <img src="${g.jaquette}" class="game-jaquette"><div class="game-info"><b>${g.title}</b></div></div>`;
        });
        html += `</div>`;
    }
    view.innerHTML += html;
}

// AFFICHAGE DES CONSOLES
async function fetchConsolesByBrand(brand) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">CONSOLES ${brand}</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.CONSOLES}`;
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;
        let html = `<div class="game-grid">`;
        rows.forEach(row => {
            const rowBrand = row.c[3]?.v || ""; // Colonne D pour la marque dans Consoles
            if (rowBrand.toLowerCase().includes(brand.toLowerCase())) {
                const name = row.c[0]?.v || "";
                const img = toDirectLink(row.c[1]?.v);
                html += `<div class="game-card"><img src="${img}" class="game-jaquette" style="object-fit:contain;padding:10px;"><div class="game-info"><b>${name}</b></div></div>`;
            }
        });
        view.innerHTML += html + `</div>`;
    } catch(e) { console.error(e); }
}

// AFFICHAGE DES ACCESSOIRES (Colonnes : A=Nom, B=Image, C=Console, D=ImgConsole, F=Constructeur)
async function fetchAccessoriesByBrand(brand) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class
