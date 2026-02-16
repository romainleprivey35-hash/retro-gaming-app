async function fetchGames(brand) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center;">Chargement de ta collection...</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;
        
        // Convertit n'importe quel type de lien Google Drive en image affichable
        const toDirectLink = (val) => {
            if (!val || typeof val !== 'string') return "";
            
            // On extrait l'ID (la suite de lettres et chiffres de tes liens)
            const match = val.match(/id=([-\w]+)/) || val.match(/\/d\/([-\w]+)/);
            if (match && match[1]) {
                // On utilise le format de miniature qui est autorisé par Google pour les sites web
                return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
            }
            return val; // Si c'est pas du Drive, on renvoie le lien tel quel
        };

        const groups = {};
        rows.forEach(row => {
            const brandInSheet = row.c[2]?.v || ""; // Colonne C: Constructeur
            if (brandInSheet.toLowerCase().includes(brand.toLowerCase())) {
                const consoleName = row.c[4]?.v || "Autre"; // Colonne E: Console
                if (!groups[consoleName]) groups[consoleName] = [];
                
                const getVal = (idx) => row.c[idx]?.v || "";

                groups[consoleName].push({
                    title: getVal(0),        // Col A
                    logoTitre: toDirectLink(getVal(1)), // Col B (Logo Nom)
                    console: consoleName,    // Col E
                    keyArt: toDirectLink(getVal(5)),    // Col F (Key art)
                    jaquette: toDirectLink(getVal(6)),  // Col G (Jaquette)
                    price: getVal(12),       // Col M
                    isOwned: getVal(14)      // Col O
                });
            }
        });
        displayResults(brand, groups);
    } catch (e) { 
        viewList.innerHTML = `<h2 style="text-align:center;">Erreur de chargement</h2>`; 
    }
}

function displayResults(brand, groups) {
    let html = `<h2 style="text-align:center; margin:20px 0; letter-spacing:1px;">${brand.toUpperCase()}</h2>`;
    for (const consoleName in groups) {
        const logoId = CONFIG.CONSOLE_LOGOS[consoleName] || "";
        html += `<div class="console-header">${logoId ? `<img src="https://drive.google.com/thumbnail?id=${logoId}&sz=w200" class="console-logo">` : ""}<h3>${consoleName}</h3></div>`;
        html += `<div class="game-grid">`;
        
        groups[consoleName].forEach(game => {
            const isMissing = game.isOwned.includes("❌") || game.isOwned.toLowerCase().includes("non");
            const opacity = isMissing ? "0.3" : "1";
            
            // Priorité à la jaquette pour la liste
            const mainImg = game.jaquette || "https://via.placeholder.com/150x200?text=No+Image";
            
            const gameData = btoa(unescape(encodeURIComponent(JSON.stringify(game))));
            html += `
                <div class="game-card" style="opacity:${opacity}" onclick="openGameDetail('${gameData}')">
                    <img src="${mainImg}" class="game-jaquette">
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
            <h1 style="margin:0;">${game.title}</h1>
            <p style="color:#888;">${game.console}</p>
            <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #333; margin:25px 0;">
                <p style="margin:0; color:#00ff00; font-size:2em; font-weight:bold;">${game.price}€</p>
            </div>
            <p>Possédé : ${game.isOwned}</p>
        </div>
    `;
    document.body.appendChild(detailDiv);
}
