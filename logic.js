const SHEET_ID = "1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU";
let currentBrand = "";

function init() {
    currentBrand = "";
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').innerHTML = "<h1>SÉLECTIONNE UNE MARQUE</h1>";
    
    view.innerHTML = `
        <div class="brand-selection">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg" onclick="selectBrand('Nintendo')">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg" onclick="selectBrand('Playstation')">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_2012.svg" onclick="selectBrand('Xbox')">
        </div>
    `;
}

function selectBrand(brand) {
    currentBrand = brand;
    // On lance directement l'affichage des jeux comme avant
    renderCategory('Jeux');
}

async function renderCategory(category) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<h2 class="loading">Chargement...</h2>`;

    // URL fixe sur l'onglet Jeux qui fonctionnait
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Jeux`;
    
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;

        const items = rows.map(row => {
            if (!row.c) return null;
            return {
                title: row.c[0]?.v,
                constructor: row.c[2]?.v, // Colonne C pour les Jeux
                consoleName: row.c[4]?.v,
                img: toDirectLink(row.c[6]?.v),
                price: row.c[12]?.v,
                owned: row.c[14]?.v
            };
        }).filter(item => {
            return item && item.title && item.constructor?.toString().toLowerCase().trim() === currentBrand.toLowerCase().trim();
        });

        // Cette fonction renderGrid est celle qui contient tout ton design/effets
        renderGrid(items);
        
        document.getElementById('ui-header').innerHTML = `<button class="btn-back" onclick="init()">⬅ RETOUR</button>`;

    } catch (e) {
        console.error("Erreur");
    }
}

function toDirectLink(id) {
    if (!id) return "";
    if (id.includes('http')) return id;
    return `https://drive.google.com/uc?export=view&id=${id}`;
}

window.onload = init;
