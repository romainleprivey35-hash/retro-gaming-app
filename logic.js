async function fetchGames(brand) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center;">Chargement...</h2>`;
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
                
                // Transformation du lien Drive en image directe
                let rawImg = row.c[0]?.v || "";
                let imgUrl = rawImg;
                if(rawImg.includes('id=')) {
                    let id = rawImg.split('id=')[1].split('&')[0];
                    imgUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w400`;
                }

                groups[consoleName].push({
                    imgJaquette: imgUrl,
                    title: row.c[1]?.v || "Sans titre",
                    price: row.c[12]?.v || "0",
                    isOwned: row.c[14]?.v || ""
                });
            }
        });

        displayResults(brand, groups);
    } catch (e) { viewList.innerHTML = "Erreur de chargement."; }
}

function displayResults(brand, groups) {
    let html = `<h2 style="text-align:center; margin:20px 0;">Jeux ${brand}</h2>`;
    
    for (const consoleName in groups) {
        const logoId = CONFIG.CONSOLE_LOGOS[consoleName] || "";
        
        html += `<div class="console-header">
                    ${logoId ? `<img src="https://drive.google.com/thumbnail?id=${logoId}&sz=w200" class="console-logo">` : ""}
                    <h3 style="margin:0;">${consoleName}</h3>
                </div>`;
        
        html += `<div class="game-grid">`;
        
        groups[consoleName].forEach(game => {
            const opacity = game.isOwned.includes("❌") ? "0.3" : "1";
            html += `
                <div class="game-card" style="opacity:${opacity}">
                    <img src="${game.imgJaquette}" class="game-jaquette" onerror="this.src='https://via.placeholder.com/150x200?text=Image+Manquante'">
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
