const SHEET_ID = "1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU";
let currentBrand = "";

// Initialisation - Écran des marques
function init() {
    currentBrand = "";
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').innerHTML = "<h1>SELECTIONNE UNE MARQUE</h1>";
    
    view.innerHTML = `
        <div class="brand-selection">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg" onclick="selectBrand('Nintendo')">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg" onclick="selectBrand('Playstation')">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_2012.svg" onclick="selectBrand('Xbox')">
        </div>
    `;
}

// Choix de la catégorie
function selectBrand(brand) {
    currentBrand = brand;
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').innerHTML = `<h1>${brand.toUpperCase()}</h1>`;

    view.innerHTML = `
        <div class="categories-container">
            <div class="cat-card" onclick="renderCategory('Jeux')">JEUX</div>
            <div class="cat-card" onclick="renderCategory('Consoles')">CONSOLES</div>
            <div class="cat-card" onclick="renderCategory('Accessoires')">ACCESSOIRES</div>
        </div>
        <button class="btn-back" onclick="init()">RETOUR</button>
    `;
}

// La fonction que tu aimais, adaptée pour tes 3 onglets
async function renderCategory(category) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<h2 class="loading">Chargement...</h2>`;

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(category)}`;
    
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;

        // On définit la colonne Constructeur selon l'onglet (C=2, D=3, F=5)
        let colConst = 2; 
        if (category === "Consoles") colConst = 3;
        if (category === "Accessoires") colConst = 5;

        const items = rows.map(row => {
            if (!row.c) return null;
            return {
                title: row.c[0]?.v,              // Col A
                constructor: row.c[colConst]?.v, // Col dynamique
                consoleName: row.c[4]?.v,        // Col E
                img: toDirectLink(row.c[6]?.v),  // Col G
                price: row.c[12]?.v,             // Col M
                owned: row.c[14]?.v              // Col O
            };
        }).filter(item => {
            return item && item.title && item.constructor?.toString().toLowerCase().trim() === currentBrand.toLowerCase().trim();
        });

        renderGrid(items); // Appelle ton design de cartes
        
        document.getElementById('ui-header').innerHTML = `<button class="btn-back" onclick="selectBrand('${currentBrand}')">RETOUR</button>`;

    } catch (e) {
        console.error("Erreur de chargement");
    }
}

function toDirectLink(id) {
    if (!id) return "";
    return `https://drive.google.com/uc?export=view&id=${id}`;
}

window.onload = init;
