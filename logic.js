async function fetchGames(brand) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center;">Chargement de la collection...</h2>`;
    
    // On utilise l'ID et l'onglet définis dans config.js
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.TABS.JEUX}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;
        
        // Convertit les liens Drive classiques en images affichables
        const toDirectLink = (link) => {
            if (!link) return "";
            if (typeof link !== 'string') return "";
            if (link.includes("drive.google.com")) {
                let id = "";
                if (link.includes("id=")) {
                    id = link.split("id=")[1].split("&")[0];
                } else if (link.includes("/d/")) {
                    id = link.split("/d/")[1].split("/")[0];
                }
                return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
            }
            return link;
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
                    logoTitre: toDirectLink(getVal(1)), // Col B
                    console: consoleName,    // Col E
                    keyArt: toDirectLink(getVal(5)),    // Col F
                    jaquette: toDirectLink(getVal(6)),  // Col G
                    price: getVal(12),       // Col M
                    isOwned: getVal(14),     // Col O
                    description: getVal(18)  // Col S
                });
            }
        });
        displayResults(brand, groups);
    } catch (e) { 
        console.error("Erreur de fetch:", e);
        viewList.innerHTML = `<h2 style="text-align:center; color:red;">Erreur de chargement</h2>`; 
    }
}

function displayResults(brand, groups) {
    let html = `<h2 style="text-align:center; margin:20px 0; text-transform:uppercase;">${brand}</h2>`;
    
    for (const consoleName in groups) {
        const logoId = CONFIG.CONSOLE_LOGOS[consoleName] || "";
        
        html += `
            <div class="console-header">
                ${logoId ? `<img src="https://drive.google.com/thumbnail?id=${logoId}&sz=w200" class="console-logo">` : ""}
                <h3 style="margin:0;">${consoleName}</h3>
            </div>`;
            
        html += `<div class="game-grid">`;
        
        groups[consoleName].forEach(game => {
            // Transparence si pas possédé (contient ❌ ou Non)
            const isMissing = game.isOwned.includes("❌") || game.isOwned.toLowerCase().includes("non");
            const opacity = isMissing ? "0.3" : "1";
            
            // On affiche la Jaquette (G), ou le KeyArt (F) en secours
            const mainImg = game.jaquette || game.keyArt || "https://via.placeholder.com/150x200?text=Image";
            
            const gameData = btoa(unescape(encodeURIComponent(JSON.stringify(game))));
            
            html += `
                <div class="game-card" style="opacity:${opacity}" onclick="openGameDetail('${gameData}')">
                    <img src="${mainImg}" class="game-jaquette" loading="lazy">
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
        <div style="position:relative; width:100%; height:300px; background:#000;">
            <img src="${game.keyArt}" class="key-art-img" onerror="this.style.display='none'">
        </div>
        <img src="${game.logoTitre}" class="title-logo-img" onerror="this.style.display='none'">
        
        <div class="detail-content">
            <h1 style="margin:0;">${game.title}</h1>
            <p style="color:#888;">${game.console}</p>
            
            <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #333; margin:25px 0;">
                <p style="margin:0; color:#00ff00; font-size:2em; font-weight:bold;">${game.price}€</p>
                <p style="margin:5px 0 0 0; color:#666; font-size:0.8em;">COTE ACTUELLE</p>
            </div>
            
            <div style="text-align:left; color:#ccc; line-height:1.6; margin-bottom:30px;">
                ${game.description}
            </div>
            
            <div style="padding:15px; border-radius:10px; background:${game.isOwned.includes('❌') ? '#331111' : '#113311'}; border:1px solid rgba(255,255,255,0.1);">
                Possédé : ${game.isOwned}
            </div>
        </div>
    `;
    document.body.appendChild(detailDiv);
}
