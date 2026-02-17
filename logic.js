const SHEET_ID = "1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU";
let currentBrand = "";

// Initialisation de l'affichage des marques
function init() {
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').innerHTML = "<h1>SÉLECTIONNE UNE MARQUE</h1>";
    
    // Ton design de boutons de marques
    view.innerHTML = `
        <div class="brand-grid">
            <div class="brand-card" onclick="selectBrand('Nintendo')">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg" alt="Nintendo">
            </div>
            <div class="brand-card" onclick="selectBrand('Playstation')">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg" alt="Playstation">
            </div>
            <div class="brand-card" onclick="selectBrand('Xbox')">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_2012.svg" alt="Xbox">
            </div>
        </div>
    `;
}

// Sélection de la marque et affichage des catégories (Jeux, Consoles, etc.)
function selectBrand(brand) {
    currentBrand = brand;
    const view = document.getElementById('view-list');
    document.getElementById('ui-header').innerHTML = `<h1>${brand.toUpperCase()}</h1>`;

    view.innerHTML = `
        <div class="categories-grid">
            <div class="category-card" onclick="renderCategory('Jeux')">🎮 JEUX</div>
            <div class="category-card" onclick="renderCategory('Consoles')">🕹️ CONSOLES</div>
            <div class="category-card" onclick="renderCategory('Accessoires')">🔌 ACCESSOIRES</div>
        </div>
        <button class="back-btn" onclick="init()">⬅ RETOUR</button>
    `;
}

// LA FONCTION QUI FILTRE (C'est celle-ci qui marchait)
async function renderCategory(category) {
    const view = document.getElementById('view-list');
    view.innerHTML = `<h2 class="loading-text">Chargement de ${category}...</h2>`;

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(category)}`;
    
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        const jsonData = JSON.parse(text.substr(47).slice(0, -2));
        const rows = jsonData.table.rows;

        // On définit la colonne Constructeur selon l'onglet
        let colConstructeur = 2; // Par défaut C pour les Jeux
        if (category === "Consoles") colConstructeur = 3;    // D
        if (category === "Accessoires") colConstructeur = 5; // F

        const items = rows.map(row => {
            if (!row.c) return null;
            return {
                title: row.c[0]?.v,              // Nom en A
                constructor: row.c[colConstructeur]?.v || "", 
                consoleName: row.c[4]?.v || "",  // Console en E
                img: toDirectLink(row.c[6]?.v),  // Image en G
                price: row.c[12]?.v || 0,        // Prix en M
                owned: row.c[14]?.v || "NON"     // Possédé en O
            };
        }).filter(item => {
            return item && item.title && item.constructor.toString().toLowerCase().trim() === currentBrand.toLowerCase().trim();
        });

        if (items.length === 0) {
            view.innerHTML = `<h2 class="no-result">Aucun élément trouvé</h2>`;
        } else {
            renderGrid(items); // Ta fonction qui dessine les cartes
        }

        document.getElementById('ui-header').innerHTML = `<button class="back-btn" onclick="selectBrand('${currentBrand}')">⬅ RETOUR</button>`;

    } catch (e) {
        console.error(e);
    }
}

// Ta fonction utilitaire pour les images Drive
function toDirectLink(id) {
    if (!id) return "https://via.placeholder.com/150";
    if (id.includes('http')) return id;
    return `https://drive.google.com/uc?export=view&id=${id}`;
}

// Initialise l'app au chargement
window.onload = init;
