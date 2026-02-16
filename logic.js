let allGames = [];
let currentBrand = "";

// 1. Initialisation
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

// 2. Navigation
function selectBrand(brand) {
    currentBrand = brand;
    let color = "#333";
    if (brand.includes("Nintendo")) color = "#e60012";
    if (brand.includes("Sony") || brand.includes("Playstation")) color = "#00439c";
    if (brand.includes("Xbox")) color = "#107c10";
    document.documentElement.style.setProperty('--brand-color', color);
    showCategories();
}

function showCategories() {
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="sticky-header"><button onclick="location.reload()">⬅ Retour</button></div>
        <h2 style="text-align:center; margin-top:80px;">${currentBrand.toUpperCase()}</h2>
        <div class="game-grid">
            <div class="game-card brand-btn" onclick="fetchGamesByBrand()">🎮 JEUX</div>
            <div class="game-card brand-btn" onclick="fetchConsolesByBrand()">🕹️ CONSOLES</div>
            <div class="game-card brand-btn" onclick="fetchAccessoriesByBrand()">🎧 ACCESSOIRES</div>
        </div>`;
}

// 3. Logique d'animation (Fusion)
function handleCardClick(imgSrc, data) {
    const overlay = document.getElementById('overlay');
    const container = document.getElementById('flip-container');
    const front = container.querySelector('.side-front');
    const back = container.querySelector('.side-back');
    
    // Reset l'état
    container.classList.remove('zoom', 'is-flipped');
    
    // Remplir les faces
    front.innerHTML = `<img src="${imgSrc}" style="width:100%;">`;
    back.innerHTML = `
        <button onclick="closeEverything()" style="background:var(--brand-color);color:white;border:none;padding:15px;border-radius:10px;width:100%;font-weight:bold;margin-bottom:20px;">✕ FERMER</button>
        <img src="${imgSrc}" style="width:100%; max-height:200px; object-fit:contain; margin-bottom:15px;">
        <h2 style="text-align:center;">${data.title}</h2>
        <div style="background:#f5f5f5; padding:15px; border-radius:12px;">
            <p><b>Console :</b> ${data.console}</p>
            <p><b>Prix :</b> ${data.price}€</p>
            <p><b>Possédé :</b> ${data.owned}</p>
        </div>
    `;
    
    overlay.style.display = 'block';
    container.style.display = 'block';
    
    setTimeout(() => { container.classList.add('zoom'); }, 50);
}

function handleFloatingClick() {
    const container = document.getElementById('flip-container');
    container.classList.add('bounce');
    
    setTimeout(() => {
        container.classList.remove('bounce');
        container.classList.add('is-flipped');
    }, 200); // 50% du rebond
}

function closeEverything() {
    const container = document.getElementById('flip-container');
    container.classList.remove('zoom', 'is-flipped');
    setTimeout(() => {
        document.getElementById('overlay').style.display = 'none';
        container.style.display = 'none';
    }, 600);
}

// 4. Chargement des données
async function fetchGamesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">JEUX</h2><div style="text-align:center;">Chargement...</div>`;
    
    if (allGames.length === 0) await preloadData();
    view.querySelector('div:last-child').remove();

    const groups = {};
    allGames.forEach(row => {
        if ((row.c[2]?.v || "").toLowerCase().includes(currentBrand.toLowerCase())) {
            const c = row.c[4]?.v || "Autre";
            if (!groups[c]) groups[c] = [];
            groups[c].push({ title: row.c[0]?.v, img: toDirectLink(row.c[6]?.v), price: row.c[12]?.v, owned: row.c[14]?.v || "", console: c });
        }
    });

    for (const c in groups) {
        const titleDiv = document.createElement('div');
        titleDiv.style.padding = "15px 15px 0"; titleDiv.innerHTML = `<b>${c}</b>`;
        view.appendChild(titleDiv);
        const grid = document.createElement('div'); grid.className = 'game-grid';
        groups[c].forEach(g => {
            const card = document.createElement('div'); 
            card.className = 'game-card';
            card.style.opacity = g.owned.includes('✅') ? '1' : '0.4';
            card.onclick = () => handleCardClick(g.img, g);
            card.innerHTML = `<img src="${g.img}">`;
            grid.appendChild(card);
        });
        view.appendChild(grid);
    }
}
