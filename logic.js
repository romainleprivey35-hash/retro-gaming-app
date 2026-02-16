async function fetchGames(brand) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center;">Chargement de la galerie...</h2>`;
    
    // On appelle l'onglet "Jeux" de ton unique tableau
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;
        
        const groups = {};
        rows.forEach(row => {
            const brandInSheet = row.c[2]?.v || ""; // Colonne C: Constructeur
            if (brandInSheet.toLowerCase().includes(brand.toLowerCase())) {
                const consoleName = row.c[4]?.v || "Autre"; // Colonne E: Console
                if (!groups[consoleName]) groups[consoleName] = [];
                
                const getVal = (idx) => row.c[idx]?.v || "";

                groups[consoleName].push({
                    title: getVal(0),       // Col A
                    logoTitre: getVal(1),   // Col B
                    console: consoleName,   // Col E
                    keyArt: getVal(5),      // Col F
                    jaquette: getVal(6),    // Col G
                    price: getVal(12),      // Col M
                    isOwned: getVal(14),    // Col O
                    description: getVal(18) // Col S
                });
            }
        });
        displayResults(brand, groups);
    } catch (e) { 
        console.error(e);
        viewList.innerHTML = "Erreur : Vérifie que le partage du Sheets est bien sur 'Tous les utilisateurs'."; 
    }
}

function displayResults(brand, groups) {
    let html = `<h2 style="text-align:center; margin:20px 0; text-transform:uppercase; letter-spacing:2px;">${brand}</h2>`;
    
    for (const consoleName in groups) {
        const logoId = CONFIG.CONSOLE_LOGOS[consoleName] || "";
        
        html += `
            <div class="console-header">
                ${logoId ? `<img src="https://drive.google.com/thumbnail?id=${logoId}&sz=w200" class="console-logo">` : ""}
                <h3 style="margin:0; font-size:1.2em;">${consoleName}</h3>
            </div>`;
            
        html += `<div class="game-grid">`;
        
        groups[consoleName].forEach(game => {
            // Règle de transparence pour les jeux non possédés
            const isMissing = game.isOwned.toLowerCase().includes("non") || game.isOwned.includes("❌");
            const opacity = isMissing ? "0.3" : "1";
            
            // On essaie d'abord la jaquette (G), sinon le Logo (B), sinon le KeyArt (F)
            const mainImg = game.jaquette || game.logoTitre || game.keyArt || "https://via.placeholder.com/150x200?text=No+Image";
            
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
    
    // Pour la fiche, on utilise bien les images spécifiques demandées
    detailDiv.innerHTML = `
        <button class="close-detail-btn" onclick="document.getElementById('active-detail').remove()">✕</button>
        <div style="position:relative; width:100%; height:300px; background:#111;">
            <img src="${game.keyArt || game.jaquette}" class="key-art-img" onerror="this.style.display='none'">
        </div>
        <img src="${game.logoTitre || game.jaquette}" class="title-logo-img" onerror="this.style.display='none'">
        
        <div class="detail-content">
            <h1 style="margin:0; font-size:1.8em;">${game.title}</h1>
            <p style="color:#888; margin:5px 0;">${game.console}</p>
            
            <div style="background:linear-gradient(145deg, #1a1a1a, #0a0a0a); padding:20px; border-radius:15px; border:1px solid #333; margin:25px 0;">
                <p style="margin:0; color:#00ff00; font-size:2em; font-weight:bold;">${game.price}€</p>
                <p style="margin:5px 0 0 0; color:#666; font-size:0.8em; text-transform:uppercase;">Estimation Market</p>
            </div>
            
            <div style="text-align:left; color:#ccc; line-height:1.6; font-size:0.95em; margin-bottom:30px;">
                ${game.description}
            </div>
            
            <div style="padding:15px; border-radius:10px; background:${game.isOwned.includes('❌') ? '#3d1010' : '#103d10'}; border:1px solid rgba(255,255,255,0.1);">
                Statut : ${game.isOwned}
            </div>
        </div>
    `;
    document.body.appendChild(detailDiv);
}
