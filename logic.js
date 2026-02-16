let allGames = [];

// Fonction de conversion d'image Drive
const toDirectLink = (val) => {
    if (!val || typeof val !== 'string') return "";
    const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800` : val;
};

async function fetchGames(brand) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center;">Chargement...</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        allGames = json.table.rows;
        
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
    } catch (e) { viewList.innerHTML = "Erreur de chargement."; }
}

async function fetchConsoles() {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center;">Mes Consoles...</h2>`;
    
    if (allGames.length === 0) {
        const resp = await fetch(`https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`);
        const txt = await resp.text();
        allGames = JSON.parse(txt.substr(47).slice(0, -2)).table.rows;
    }

    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.CONSOLES}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const consoleRows = json.table.rows;

        let html = `<h2 style="text-align:center; margin:20px 0;">MA COLLECTION</h2>`;
        html += `<div class="game-grid">`;

        consoleRows.forEach(row => {
            const name = row.c[0]?.v || "";
            if(!name) return;
            
            const imgConsole = toDirectLink(row.c[1]?.v); // B
            const logoConsole = toDirectLink(row.c[2]?.v); // C

            const gamesForThis = allGames.filter(g => (g.c[4]?.v || "") === name);
            const total = gamesForThis.length;
            const owned = gamesForThis.filter(g => (g.c[14]?.v || "").includes("✅")).length;

            const consoleData = btoa(unescape(encodeURIComponent(JSON.stringify({
                name, imgConsole, logoConsole, total, owned
            }))));

            html += `
                <div class="game-card" onclick="openConsoleDetail('${consoleData}')">
                    <img src="${imgConsole}" class="game-jaquette" style="object-fit: contain; padding:15px; background:#0a0a0a;">
                    <div class="game-info">
                        <div class="game-title">${name}</div>
                        <div style="font-size:0.8em; color:#00ff00; font-weight:bold;">${owned} / ${total} JEUX</div>
                    </div>
                </div>`;
        });

        html += `</div>`;
        viewList.innerHTML = html;
    } catch (e) { viewList.innerHTML = "Erreur onglet Consoles."; }
}

function openConsoleDetail(encodedData) {
    const data = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
    const detailDiv = document.createElement('div');
    detailDiv.className = "full-page-detail";
    detailDiv.id = "active-detail";
    
    detailDiv.innerHTML = `
        <button class="close-detail-btn" onclick="document.getElementById('active-detail').remove()">✕</button>
        <div style="background:#000; padding:40px 20px; text-align:center;">
            <img src="${data.logoConsole}" style="width:80%; max-width:300px; object-fit:contain;">
        </div>
        <div style="text-align:center; padding:20px;">
            <img src="${data.imgConsole}" style="width:90%; max-height:300px; object-fit:contain; margin-bottom:20px;">
            <h1 style="margin:10px 0;">${data.name}</h1>
            <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #333; margin:20px;">
                <p style="margin:0; color:#00ff00; font-size:1.5em; font-weight:bold;">${data.owned} sur ${data.total}</p>
                <p style="margin:5px 0 0 0; color:#888; font-size:0.9em;">Jeux possédés</p>
            </div>
            <p style="color:#666; font-size:0.9em;">Progression : ${Math.round((data.owned/data.total)*100) || 0}%</p>
        </div>
    `;
    document.body.appendChild(detailDiv);
}

// Garde displayResults et openGameDetail (pour les jeux) comme avant
function displayResults(brand, groups) {
    let html = `<h2 style="text-align:center; margin:20px 0;">${brand.toUpperCase()}</h2>`;
    for (const consoleName in groups) {
        const logoId = CONFIG.CONSOLE_LOGOS[consoleName] || "";
        html += `<div class="console-header">${logoId ? `<img src="https://drive.google.com/thumbnail?id=${logoId}&sz=w200" class="console-logo">` : ""}<h3>${consoleName}</h3></div>`;
        html += `<div class="game-grid">`;
        groups[consoleName].forEach(game => {
            const isMissing = game.isOwned.includes("❌") || game.isOwned.toLowerCase().includes("non");
            const gameData = btoa(unescape(encodeURIComponent(JSON.stringify(game))));
            html += `
                <div class="game-card" style="opacity:${isMissing ? '0.3' : '1'}" onclick="openGameDetail('${gameData}')">
                    <img src="${game.jaquette}" class="game-jaquette">
                    <div class="game-info">
                        <div class="game-title">${game.title}</div>
                        <div class="game-price">${game.price}€</div>
                    </div>
                </div>`;
        });
        html += `</div>`;
    }
    document.getElementById('view-list').innerHTML = html;
}

function openGameDetail(encodedData) {
    const game = JSON.parse(decodeURIComponent(escape(atob(encodedData))));
    const detailDiv = document.createElement('div');
    detailDiv.className = "full-page-detail";
    detailDiv.id = "active-detail";
    detailDiv.innerHTML = `
        <button class="close-detail-btn" onclick="document.getElementById('active-detail').remove()">✕</button>
        <img src="${game.keyArt || game.jaquette}" class="key-art-img">
        <img src="${game.logoTitre}" class="title-logo-img">
        <div class="detail-content">
            <h1>${game.title}</h1>
            <p>${game.console}</p>
            <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #333; margin:25px 0;">
                <p style="margin:0; color:#00ff00; font-size:2em; font-weight:bold;">${game.price}€</p>
            </div>
            <p>Possédé : ${game.isOwned}</p>
        </div>
    `;
    document.body.appendChild(detailDiv);
}
