const CONFIG = {
    SHEET_ID: "1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU"
};

let currentBrand = "";

// 1. FONCTION D'ACCUEIL (Choix de la marque)
function init() {
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').innerHTML = "<h1>SELECTIONNE UNE MARQUE</h1>";
    
    // Remplace les liens par tes vrais logos si besoin
    view.innerHTML = `
        <div class="brand-selection">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg" onclick="selectBrand('Nintendo')" style="width:200px; cursor:pointer; margin:20px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg" onclick="selectBrand('Playstation')" style="width:200px; cursor:pointer; margin:20px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_2012.svg" onclick="selectBrand('Xbox')" style="width:200px; cursor:pointer; margin:20px;">
        </div>
    `;
}

// 2. CHOIX DE LA CATEGORIE (Après avoir cliqué sur une marque)
function selectBrand(brand) {
    currentBrand = brand;
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').innerHTML = `<h1>${brand.toUpperCase()}</h1>`;

    view.innerHTML = `
        <div class="categories-container" style="display:flex; justify-content:center; gap:50px; margin-top:50px;">
            <div onclick="renderCategory('Jeux')" style="cursor:pointer; text-align:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/3408/3408506.png" width="100"><br>JEUX
            </div>
            <div onclick="renderCategory('Consoles')" style="cursor:pointer; text-align:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/583/583307.png" width="100"><br>CONSOLES
            </div>
            <div onclick="renderCategory('Accessoires')" style="cursor:pointer; text-align:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/808/808513.png" width="100"><br>ACCESSOIRES
            </div>
        </div>
        <div style="text-align:center; margin-top:50px;">
            <button onclick="init()">⬅ RETOUR AUX MARQUES</button>
        </div>
    `;
}

// 3. CHARGEMENT ET FILTRAGE DE L'ONGLET CLIQUE
async function renderCategory(category) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<h2 style="color:white; text-align:center;">Chargement de l'onglet ${category}...</h2>`;

    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(category)}`;
    
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;

        // On définit la colonne Constructeur (C=2, D=3, F=5)
        let colConstructeur;
        if (category === "Jeux") colConstructeur = 2;
        else if (category === "Consoles") colConstructeur = 3;
        else if (category === "Accessoires") colConstructeur = 5;

        const items = rows.map(row => {
            if (!row.c) return null;
            return {
                title: row.c[0]?.v,              // A
                constructor: row.c[colConstructeur]?.v || "", 
                consoleName: row.c[4]?.v || "",  // E
                img: toDirectLink(row.c[6]?.v),  // G
                price: row.c[12]?.v || 0,        // M
                owned: row.c[14]?.v || "NON"     // O
            };
        }).filter(item => {
            // On filtre par la marque choisie au début
            return item && item.title && item.constructor.toString().toLowerCase().trim() === currentBrand.toLowerCase().trim();
        });

        if (items.length === 0) {
            view.innerHTML = `<h2 style="color:white; text-align:center;">Aucun résultat pour ${currentBrand}.</h2>`;
        } else {
            renderGrid(items); // Cette fonction doit déjà exister dans ton code pour afficher les cartes
        }

        document.getElementById('ui-header').innerHTML = `<button onclick="selectBrand('${currentBrand}')">⬅ RETOUR AUX CATEGORIES</button>`;
    
    } catch (e) {
        view.innerHTML = `<h2 style="color:white; text-align:center;">Erreur : Vérifie l'onglet "${category}" dans ton Sheets.</h2>`;
    }
}

// Garde ta fonction toDirectLink et renderGrid en dessous...
