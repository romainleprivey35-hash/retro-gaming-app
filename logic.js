async function fetchGames(brand) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 class="title">Chargement...</h2>`;
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=Jeux`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;
        
        const groups = {};
        rows.forEach(row => {
            const brandInSheet = row.c[2]?.v || "";
            if (brandInSheet.toLowerCase().includes(brand.toLowerCase())) {
                const consoleName = row.c[4]?.v || "Autre";
                if (!groups[consoleName]) groups[consoleName] = [];
                groups[consoleName].push({
                    title: row.c[0]?.v || "Sans titre",
                    price: row.c[12]?.v || "0",
                    isOwned: row.c[14]?.v || ""
                });
            }
        });

        displayResults(brand, groups);
    } catch (e) { viewList.innerHTML = "Erreur de chargement."; }
}

function displayResults(brand, groups) {
    let html = `<h2 class="title">Jeux ${brand}</h2>`;
    
    for (const consoleName in groups) {
        const logoId = CONFIG.CONSOLE_LOGOS[consoleName] || "";
        
        // Header de la console
        html += `<div class="console-header">
                    ${logoId ? `<img src="https://drive.google.com/thumbnail?id=${logoId}&sz=w200" class="console-logo">` : ""}
                    <h3>${consoleName}</h3>
                </div>`;
        
        // Début de la grille
        html += `<div class="game-grid">`;
        
        groups[consoleName].forEach(game => {
            const opacity = game.isOwned.includes("❌") ? "0.3" : "1";
            
            html += `
                <div class="game-card" style="opacity:${opacity}" onclick='openGameDetail(${JSON.stringify(game).replace(/'/g, "&apos;")})'>
                    <img src="${game.imgJaquette}" class="game-jaquette" onerror="this.src='https://via.placeholder.com/150x200?text=No+Image'">
                    <div class="game-info">
                        <div class="game-title">${game.title}</div>
                        <div class="game-price">${game.price}€</div>
                    </div>
                </div>`;
        });
        
        html += `</div>`; // Fin de la grille
    }
    document.getElementById('view-list').innerHTML = html;
}
