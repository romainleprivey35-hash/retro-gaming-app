const SHEET_ID = '1Vw439F_75oc7AcxkDriWi_fwX2oBbAejnp-f_Puw-FU'; 
const TAB_NAME = 'Jeux'; 

// Correspondance entre tes noms de consoles et les IDs de ton Drive
const CONSOLE_LOGOS = {
    "PS1": "1DV-N37sM1AA-fl5rYe1_Urr6hh9e6eTF",
    "PS2": "10h2eIupplXfFBvQQNWRptu1EC3xTkghc",
    "PS3": "1eqVPNUIqNwzdPs4j6ALB922qNvSJozFA",
    "PS4": "1VjijUcf3nyaclZazZT8akg_4Ifo0UjGM",
    "PS5": "1F_qvq4AM8uvx1nKaRUdPWh5r1mjVqic8",
    "N64": "1iumJt5i-5Jd85ZPZLr3NR44hbhdohUh5",
    "GameCube": "1SW-jXEJnlZ4nh3jXg3IVkNGK7QzZMSze",
    "Wii": "1aAx82c4LPWz6U-JQ2jXf3fG0hwAOG_Bc",
    "GBA": "11vgmA2xIMxNHbbYMcUIwXTNgt0BVKacp",
    "GB": "1XEkPuCr2mmIvpsmjmpkrG1XumS-24wLb",
    "GBC": "1dek_9N4wDwFBhSYmUoij7OhtFfCc4hcQ",
    "DS": "1Gals-7-g_lNxOBult4FihHYiv2nKgkfP",
    "Xbox": "15i7MRlq_QVyKUsQKWsFfMSkvqALFwb2I",
    "PSP": "1zOJp5Yh0JRHhI-o4PfyFTdX_OH7j3Bmo"
};

async function fetchGames(brand) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `<h2 style="text-align:center; color:white;">Chargement...</h2>`;

    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${TAB_NAME}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        const rows = json.table.rows;

        // 1. Organiser les jeux par console
        const gamesByConsole = {};
        
        rows.forEach(row => {
            const title = row.c[0] ? row.c[0].v : "Sans titre";
            const brandInSheet = row.c[2] ? row.c[2].v : "";
            const consoleType = row.c[4] ? row.c[4].v : "Autre";
            const price = row.c[12] ? row.c[12].v : "0";
            const isOwnedValue = row.c[14] ? row.c[14].v : "";

            if (brandInSheet.toLowerCase().includes(brand.toLowerCase())) {
                if (!gamesByConsole[consoleType]) {
                    gamesByConsole[consoleType] = [];
                }
                gamesByConsole[consoleType].push({ title, price, isOwnedValue });
            }
        });

        // 2. Construire l'affichage par blocs
        let html = `<h2 style="text-align:center; color:white; margin-bottom:20px;">Jeux ${brand}</h2>`;
        
        for (const consoleName in gamesByConsole) {
            const logoId = CONSOLE_LOGOS[consoleName] || ""; // On cherche le logo
            
            html += `
                <div class="console-block" style="margin-bottom:30px;">
                    <div style="display:flex; align-items:center; margin-bottom:15px; padding-bottom:10px; border-bottom: 2px solid #333;">
                        ${logoId ? `<img src="https://drive.google.com/thumbnail?id=${logoId}&sz=w200" style="height:40px; margin-right:15px;">` : ""}
                        <h3 style="color:white; margin:0;">${consoleName}</h3>
                    </div>
                    ${gamesByConsole[consoleName].map(game => {
                        const opacity = game.isOwnedValue.includes("❌") ? "0.3" : "1";
                        return `
                            <div style="background:#1a1a1a; margin-bottom:8px; padding:12px; border-radius:8px; color:white; opacity:${opacity}; display:flex; justify-content:space-between; align-items:center;">
                                <span>${game.title}</span>
                                <span style="color:#00ff00;">${game.price}€</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        viewList.innerHTML = html;

    } catch (error) {
        viewList.innerHTML = `<p style="color:red; text-align:center;">Erreur de chargement.</p>`;
    }
}

// Les fonctions openBrand, renderCategories et goBack restent identiques
