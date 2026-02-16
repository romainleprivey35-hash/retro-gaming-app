let allGames = [];

const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

// Charge les jeux au démarrage pour être sûr d'avoir les stats
async function preloadData() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;
    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        allGames = json.table.rows;
    } catch (e) { console.error("Erreur chargement jeux", e); }
}

async function fetchGames(brand) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center;">Chargement...</h2>`;
    if (allGames.length === 0) await preloadData();

    const groups = {};
    allGames.forEach(row => {
        const brandInSheet = row.c[2]?.v || "";
        if (brandInSheet.toLowerCase().includes(brand.toLowerCase())) {
            const consoleName = row.c[4]?.v || "Autre";
            if (!groups[consoleName]) groups[consoleName] = [];
            groups[consoleName].push({
                title: row.c[0]?.v || "",
                logoTitre: toDirectLink(row.c[1]?.v),
                console: consoleName,
                keyArt: toDirectLink(row.c[5]?.v),
                jaquette: toDirectLink(row.c[6]?.v),
                price: row.c[12]?.v || "0",
                isOwned: row.c[14]?.v || ""
            });
        }
    });
    displayResults(brand, groups);
}

async function fetchConsoles() {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center;">Mes Consoles...</h2>`;
    if (allGames.length === 0) await preloadData();

    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.CONSOLES}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;

        let html = `<h2 style="text-align:center; margin:20px 0;">MA COLLECTION</h2><div class="game-grid">`;
        rows.forEach(row => {
            const name = row.c[0]?.v || "";
            if(!name) return;
            const imgC = toDirectLink(row.c[1]?.v);
            const logoC = toDirectLink(row.c[2]?.v);
            const stats = allGames.filter(g => (g.c[4]?.v || "").trim() === name.trim());
            const owned = stats.filter(g => (g.c[14]?.v || "").includes("✅")).length;
            const total = stats.length;

            const data = btoa(unescape(encodeURIComponent(JSON.stringify({name, imgC, logoC, total, owned}))));
            html += `
                <div class="game-card" onclick="openConsoleDetail('${data}')">
                    <img src="${imgC}" class="game-jaquette" style="object-fit:contain; padding:15px; background:#0a0a0a;">
                    <div class="game-info">
                        <div class="game-title">${name}</div>
                        <div style="font-size:0.8em; color:#00ff00;">${owned} / ${total} JEUX</div>
                    </div>
                </div>`;
        });
        viewList.innerHTML = html + `</div>`;
    } catch (e) { viewList.innerHTML = "Erreur : Vérifie que l'onglet 'Consoles' existe bien."; }
}

function openConsoleDetail(encoded) {
    const d = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    const div = document.createElement('div');
    div.className = "full-page-detail"; div.id = "active-detail";
    div.innerHTML = `
        <button class="close-detail-btn" onclick="document.getElementById('active-detail').remove()">✕</button>
        <div style="background:#000; padding:40px 20px; text-align:center;"><img src="${d.logoC}" style="width:80%; max-width:250px;"></div>
        <div style="text-align:center; padding:20px;">
            <img src="${d.imgC}" style="width:80%; max-height:250px; object-fit:contain;">
            <h1>${d.name}</h1>
            <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #333; margin:20px;">
                <p style="color:#00ff00; font-size:1.5em; font-weight:bold;">${d.owned} / ${d.total}</p>
                <p style="color:#888;">Jeux en collection</p>
            </div>
        </div>`;
    document.body.appendChild(div);
}

function displayResults(brand, groups) {
    let html = `<h2 style="text-align:center; margin:20px 0;">${brand.toUpperCase()}</h2>`;
    for (const c in groups) {
        html += `<div class="console-header"><h3>${c}</h3></div><div class="game-grid">`;
        groups[c].forEach(g => {
            const data = btoa(unescape(encodeURIComponent(JSON.stringify(g))));
            html += `<div class="game-card" style="opacity:${g.isOwned.includes('❌') ? '0.3':'1'}" onclick="openGameDetail('${data}')">
                <img src="${g.jaquette}" class="game-jaquette"><div class="game-info"><b>${g.title}</b><br>${g.price}€</div></div>`;
        });
        html += `</div>`;
    }
    document.getElementById('view-list').innerHTML = html;
}

function openGameDetail(encoded) {
    const g = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    const div = document.createElement('div');
    div.className = "full-page-detail"; div.id = "active-detail";
    div.innerHTML = `
        <button class="close-detail-btn" onclick="document.getElementById('active-detail').remove()">✕</button>
        <img src="${g.keyArt || g.jaquette}" class="key-art-img">
        <img src="${g.logoTitre}" class="title-logo-img">
        <div class="detail-content"><h1>${g.title}</h1><p>${g.console}</p>
        <div style="background:#111; padding:20px; border-radius:15px;"><b>${g.price}€</b></div></div>`;
    document.body.appendChild(div);
}
