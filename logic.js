let allGames = [];
let currentBrand = "";

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

function showCategories() {
    const view = document.getElementById('view-list');
    view.innerHTML = `
        <div class="sticky-header"><button onclick="location.reload()">⬅ Retour</button></div>
        <h2 style="text-align:center; margin-top:80px;">${currentBrand.toUpperCase()}</h2>
        <div class="game-grid">
            <div class="game-card" onclick="fetchGamesByBrand()"><div class="card-face card-front" style="display:flex;align-items:center;justify-content:center;">🎮 JEUX</div></div>
            <div class="game-card" onclick="fetchConsolesByBrand()"><div class="card-face card-front" style="display:flex;align-items:center;justify-content:center;">🕹️ CONSOLES</div></div>
            <div class="game-card" onclick="fetchAccessoriesByBrand()"><div class="card-face card-front" style="display:flex;align-items:center;justify-content:center;">🎧 ACCESSOIRES</div></div>
        </div>`;
}

function handleCardClick(card, data) {
    const overlay = document.getElementById('overlay');
    if (!card.classList.contains('focused')) {
        overlay.style.display = 'block';
        card.classList.add('focused');
    } else {
        card.classList.add('bounce');
        setTimeout(() => {
            const detail = document.getElementById('full-detail');
            detail.style.display = 'block';
            detail.innerHTML = `
                <button onclick="this.parentElement.style.display='none'" style="background:var(--brand-color);color:white;border:none;padding:10px;border-radius:10px;width:100%;">Fermer</button>
                <img src="${data.img}" style="width:100%;margin-top:20px;border-radius:10px;">
                <h1>${data.title}</h1>
                <p><b>Console :</b> ${data.console}</p>
                <p><b>Prix :</b> ${data.price}€</p>
                <p><b>Possédé :</b> ${data.owned}</p>
            `;
            closeFocus();
        }, 400);
    }
}

function closeFocus() {
    const f = document.querySelector('.focused');
    if(f) f.classList.remove('focused', 'bounce');
    document.getElementById('overlay').style.display = 'none';
}

async function fetchGamesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div id="overlay" onclick="closeFocus()"></div><div id="full-detail"></div><div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">JEUX</h2>`;
    if (allGames.length === 0) await preloadData();
    const groups = {};
    allGames.forEach(row => {
        if ((row.c[2]?.v || "").toLowerCase().includes(currentBrand.toLowerCase())) {
            const c = row.c[4]?.v || "Autre";
            if (!groups[c]) groups[c] = [];
            groups[c].push({ title: row.c[0]?.v, img: toDirectLink(row.c[6]?.v), price: row.c[12]?.v, owned: row.c[14]?.v, console: c });
        }
    });
    for (const c in groups) {
        view.innerHTML += `<div class="console-header"><h3>${c}</h3></div><div class="game-grid">`;
        groups[c].forEach(g => {
            const btn = document.createElement('div');
            btn.className = 'game-card';
            btn.style.opacity = g.owned.includes('✅') ? '1' : '0.4';
            btn.onclick = () => handleCardClick(btn, g);
            btn.innerHTML = `<div class="card-face card-front"><img src="${g.img}"></div>`;
            view.lastChild.appendChild(btn);
        });
    }
}

async function fetchConsolesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div id="overlay" onclick="closeFocus()"></div><div id="full-detail"></div><div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">CONSOLES</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.CONSOLES}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    const grid = document.createElement('div'); grid.className = 'game-grid';
    rows.forEach(row => {
        if ((row.c[3]?.v || "").toLowerCase().includes(currentBrand.toLowerCase())) {
            const g = { title: row.c[0]?.v, img: toDirectLink(row.c[1]?.v), console: row.c[3]?.v, price: "?", owned: "✅" };
            const btn = document.createElement('div'); btn.className = 'game-card';
            btn.onclick = () => handleCardClick(btn, g);
            btn.innerHTML = `<div class="card-face card-front"><img src="${g.img}" style="object-fit:contain;padding:10px;"></div>`;
            grid.appendChild(btn);
        }
    });
    view.appendChild(grid);
}

async function fetchAccessoriesByBrand() {
    const view = document.getElementById('view-list');
    view.innerHTML = `<div id="overlay" onclick="closeFocus()"></div><div id="full-detail"></div><div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div><h2 style="text-align:center;margin-top:80px;">ACCESSOIRES</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.ACCESSOIRES}`;
    const resp = await fetch(url);
    const text = await resp.text();
    const rows = JSON.parse(text.substr(47).slice(0, -2)).table.rows;
    const grid = document.createElement('div'); grid.className = 'game-grid';
    rows.forEach(row => {
        if ((row.c[5]?.v || "").toLowerCase().includes(currentBrand.toLowerCase())) {
            const g = { title: row.c[0]?.v, img: toDirectLink(row.c[1]?.v), console: row.c[2]?.v, price: "?", owned: "✅" };
            const btn = document.createElement('div'); btn.className = 'game-card';
            btn.onclick = () => handleCardClick(btn, g);
            btn.innerHTML = `<div class="card-face card-front"><img src="${g.img}" style="object-fit:contain;padding:10px;"></div>`;
            grid.appendChild(btn);
        }
    });
    view.appendChild(grid);
}
