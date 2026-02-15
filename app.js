// ID de ton tableau "Retro Gaming App"
const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU'; 
const TAB_NAME = 'Jeux'; 

async function fetchGames(brand) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center; color:white;">Chargement...</h2>`;

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${TAB_NAME}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;

        let html = `<h2 style="text-align:center; color:white;">Jeux ${brand}</h2>`;
        
        rows.forEach(row => {
            // Mapping exact de tes colonnes 
            const title = row.c[0] ? row.c[0].v : "Sans titre";      // Colonne A
            const brandInSheet = row.c[2] ? row.c[2].v : "";        // Colonne C
            const consoleType = row.c[4] ? row.c[4].v : "";         // Colonne E
            const price = row.c[12] ? row.c[12].v : "0";            // Colonne M
            const isOwnedValue = row.c[14] ? row.c[14].v : "";       // Colonne O (Contient l'emoji)

            // Filtrage par marque (on compare avec la colonne C)
            if (brandInSheet.toLowerCase().includes(brand.toLowerCase())) {
                
                // Si l'emoji est "❌ Non", on met de la transparence 
                const opacity = isOwnedValue.includes("❌") ? "0.3" : "1";

                html += `
                    <div style="background:#1a1a1a; margin-bottom:10px; padding:15px; border-radius:10px; color:white; opacity:${opacity}; display:flex; justify-content:space-between; align-items:center; border-left: 4px solid #444;">
                        <div>
                            <strong style="font-size:1.1em;">${title}</strong><br>
                            <small style="color:#aaa;">${consoleType}</small>
                        </div>
                        <div style="color:#00ff00; font-weight:bold;">${price}€</div>
                    </div>
                `;
            }
        });

        viewList.innerHTML = html;

    } catch (error) {
        viewList.innerHTML = `<p style="color:red; text-align:center;">Erreur de connexion. Vérifie le partage du Sheets.</p>`;
    }
}

// Les autres fonctions ne changent pas
function openBrand(brandName) {
    document.getElementById('view-brands').style.display = 'none';
    const viewList = document.getElementById('view-list');
    viewList.style.display = 'block';
    document.getElementById('back-btn').style.display = 'block';
    renderCategories(brandName);
}

function renderCategories(brandName) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `
        <h2 style="text-align:center; color:white; margin-bottom:30px;">${brandName}</h2>
        <div class="category-pill" onclick="fetchGames('${brandName}')">JEUX</div>
        <div class="category-pill" onclick="alert('Bientôt...')">CONSOLES</div>
        <div class="category-pill" onclick="alert('Bientôt...')">ACCESSOIRES</div>
    `;
}

function goBack() {
    document.getElementById('view-brands').style.display = 'flex';
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';
}
