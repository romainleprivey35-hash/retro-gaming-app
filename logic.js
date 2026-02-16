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
                
                let rawImg = row.c[0]?.v || "";
                let imgUrl = rawImg.includes('id=') ? `https://drive.google.com/thumbnail?id=${rawImg.split('id=')[1].split('&')[0]}&sz=w600` : rawImg;

                groups[consoleName].push({
                    img: imgUrl,
                    title: row.c[1]?.v || "Sans titre",
                    price: row.c[12]?.v || "0",
                    isOwned: row.c[14]?.v || "",
                    console: consoleName
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
        html += `<div class="console-header">${logoId ? `<img src="https://drive.google.com/thumbnail?id=${logoId}&sz=w200" class="console-logo">` : ""}<h3>${consoleName}</h3></div>`;
        html += `<div class="game-grid">`;
        groups[consoleName].forEach(game => {
            const opacity = game.isOwned.includes("❌") ? "0.3" : "1";
            // On prépare les données pour le clic
            const gameData = btoa(unescape(encodeURIComponent(JSON.stringify(game))));
            html += `
                <div class="game-card" style="opacity:${opacity}" onclick="openGameDetail('${gameData}')">
                    <img src="${game.img}" class="game-jaquette" onerror="this.src='https://via.placeholder.com/150x200?text=Image'">
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
        <img src="${game.img}" class="key-art-img">
        <img src="${game.img}" class="title-logo-img">
        <div class="detail-content">
            <h1 style="margin-top:0;">${game.title}</h1>
            <p style="color:#aaa; font-size:1.1em;">${game.console}</p>
            <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #333; margin-top:20px;">
                <p style="margin:0; color:#00ff00; font-size:1.8em; font-weight:bold;">${game.price}€</p>
                <p style="margin:5px 0 0 0; color:#888;">Cote actuelle</p>
            </div>
            <p style="margin-top:30px; font-size:1.2em;">Possédé : ${game.isOwned}</p>
        </div>
    `;
    document.body.appendChild(detailDiv);
}
