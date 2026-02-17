// CONFIGURATION DE TON FICHIER
const SHEET_ID = "1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU";
let currentBrand = "";

// 1. AU CHARGEMENT : AFFICHE LES MARQUES
window.onload = function() {
    init();
};

function init() {
    currentBrand = "";
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').innerHTML = "<h1>SELECTIONNE UNE MARQUE</h1>";
    
    view.innerHTML = `
        <div style="display:flex; justify-content:center; gap:30px; margin-top:50px;">
            <div onclick="selectBrand('Nintendo')" style="cursor:pointer; background:#fff; padding:20px; border-radius:10px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg" width="150">
            </div>
            <div onclick="selectBrand('Playstation')" style="cursor:pointer; background:#fff; padding:20px; border-radius:10px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg" width="150">
            </div>
            <div onclick="selectBrand('Xbox')" style="cursor:pointer; background:#fff; padding:20px; border-radius:10px;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_2012.svg" width="150">
            </div>
        </div>
    `;
}

// 2. APRES CLIC MARQUE : AFFICHE LES 3 CATEGORIES
function selectBrand(brand) {
    currentBrand = brand;
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').innerHTML = `<h1>${brand.toUpperCase()}</h1>`;

    view.innerHTML = `
        <div style="display:flex; justify-content:center; gap:50px; margin-top:50px; color:white; font-weight:bold;">
            <div onclick="renderCategory('Jeux')" style="cursor:pointer; text-align:center;">
                <div style="font-size:50px;">🎮</div><br>JEUX
            </div>
            <div onclick="renderCategory('Consoles')" style="cursor:pointer; text-align:center;">
                <div style="font-size:50px;">🕹️</div><br>CONSOLES
            </div>
            <div onclick="renderCategory('Accessoires')" style="cursor:pointer; text-align:center;">
                <div style="font-size:50px;">🔌</div><br>ACCESSOIRES
            </div>
        </div>
        <div style="text-align:center; margin-top:50px;">
            <button onclick="init()" style="padding:10px 20px; cursor:pointer;">⬅ RETOUR</button>
        </div>
    `;
}

// 3. RECUPERATION ET FILTRAGE DES DONNEES
async function renderCategory(category) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<h2 style="color:white; text-align:center;">Chargement de l'onglet ${category}...</h2>`;

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(category)}`;
    
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;

        // Colonnes Constructeur : Jeux=C(2), Consoles=D(3), Accessoires=F(5)
        let colConst;
        if (category === "Jeux") colConst = 2;
        else if (category === "Consoles") colConst = 3;
        else if (category === "Accessoires") colConst = 5;

        const items = rows.map(row => {
            if (!row.c) return null;
            return {
                title: row.c[0]?.v,              // A
                constructor: row.c[colConst]?.v || "", 
                consoleName: row.c[4]?.v || "",  // E
                img: row.c[6]?.v,                // G (on verra pour le lien plus tard)
                price: row.c[12]?.v || 0,        // M
                owned: row.c[14]?.v || "NON"     // O
            };
        }).filter(item => {
            return item && item.title && item.constructor.toString().toLowerCase().trim() === currentBrand.toLowerCase().trim();
        });

        if (items.length === 0) {
            view.innerHTML = `<h2 style="color:white; text-align:center;">Aucun résultat pour ${currentBrand}.</h2>`;
        } else {
            // AFFICHAGE SIMPLE POUR TESTER
            view.innerHTML = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:20px; padding:20px;">`;
            items.forEach(item => {
                view.innerHTML += `
                    <div style="background:rgba(255,255,255,0.1); color:white; padding:15px; border-radius:10px; text-align:center;">
                        <p style="font-weight:bold;">${item.title}</p>
                        <p style="font-size:12px;">${item.consoleName}</p>
                        <p style="color:#2ecc71;">${item.price}€</p>
                    </div>
                `;
            });
            view.innerHTML += `</div>`;
        }
        
        document.getElementById('ui-header').innerHTML = `<button onclick="selectBrand('${currentBrand}')">⬅ RETOUR AUX CATEGORIES</button>`;

    } catch (e) {
        view.innerHTML = `<h2 style="color:white; text-align:center;">Erreur : Vérifie ton fichier Sheet.</h2>`;
    }
}
