let allGames = [];
let currentBrand = "";

// Fonction Image ultra-robuste
const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

async function preloadData() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
    const resp = await fetch(url);
    const text = await resp.text();
    allGames = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
}

function selectBrand(brand) {
    let color = "#333";
    if (brand.includes("Nintendo")) color = "#e60012";
    if (brand.includes("Sony") || brand.includes("Playstation")) { color = "#00439c"; currentBrand = "Playstation"; }
    else currentBrand = brand;
    if (brand.includes("Xbox")) color = "#107c10";
    document.documentElement.style.setProperty('--brand-color', color);
    showCategories();
}

function handleCardClick(cardElement, gameData) {
    const overlay = document.getElementById('overlay');
    
    if (!cardElement.classList.contains('focused')) {
        // Premier clic : 360° + Zoom 70%
        overlay.style.display = 'block';
        cardElement.classList.add('focused');
    } else {
        // Deuxième clic : Rebond + Fiche complète
        cardElement.classList.add('bounce');
        setTimeout(() => {
            openFullDetail(gameData);
            closeFocus();
        }, 400);
    }
}

function closeFocus() {
    const focused = document.querySelector('.focused');
    if (focused) {
        focused.classList.remove('focused', 'bounce');
        document.getElementById('overlay').style.display = 'none';
    }
}

function openFullDetail(g) {
    const detail = document.getElementById('full-detail');
    detail.style.display = 'block';
    detail.innerHTML = `
        <button onclick="document.getElementById('full-detail').style.display='none'" 
                style="padding:10px 20px; background:var(--brand-color); color:white; border:none; border-radius:20px; margin-bottom:20px;">✕ Fermer</button>
        <img src="${g.jaquette}" style="width:100%; border-radius:15px; box-shadow: 0 10px 20px rgba(0,0,0,0.2);">
        <h1 style="margin-top:20px;">${g.title}</h1>
        <hr>
        <div style="font-size:1.1em; line-height:1.6;">
            <p><b>Console :</b> ${g.console}</p>
            <p><b>Prix :</b> ${g.price}€</p>
            <p><b>Statut :</b> ${g.isOwned}</p>
            <p><b>Marque :</b> ${g.brand}</p>
        </div>
    `;
}

async function fetchGamesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div id="overlay" onclick="closeFocus()"></div>
                      <div id="full-detail" class="full-screen-detail"></div>
                      <div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div>
                      <h2 style="text-align:center;margin-top:80px;">JEUX ${currentBrand}</h2>`;
    
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
                isOwned: row.c[14]?.v || "",
                console: cName,
                brand: row.c[2]?.v
            });
        }
    });

    for (const c in groups) {
        let html = `<div class="console-header"><h3>${c}</h3></div><div class="game-grid">`;
        groups[c].forEach(g => {
            const gameJson = JSON.stringify(g).replace(/'/g, "\\'");
            html += `
                <div class="game-card" onclick='handleCardClick(this, ${gameJson})' style="opacity: ${g.isOwned.includes('✅') ? '1' : '0.4'}">
                    <div class="card-face card-front"><img src="${g.jaquette}"></div>
                </div>`;
        });
        view.innerHTML += html + `</div>`;
    }
}

// Les fonctions fetchConsoles et fetchAccessories (simplifiées pour rester cohérent)
function showCategories() {
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="sticky-header"><button onclick="location.reload()">⬅ Retour</button></div>
        <h2 style="text-align:center; margin-top:80px;">${currentBrand.toUpperCase()}</h2>
        <div class="game-grid">
            <div class="game-card" onclick="fetchGamesByBrand()">
                <div class="card-face card-front" style="display:flex; justify-content:center; align-items:center;">🎮 JEUX</div>
            </div>
            </div>`;
}
