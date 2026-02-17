// Ordre chronologique des consoles (à ajuster selon tes besoins)
const CONSOLE_ORDER = {
    "NES": 1, "Master System": 2, "SNES": 3, "Mega Drive": 4, 
    "N64": 5, "PS1": 6, "GameCube": 7, "PS2": 8, "Xbox": 9, 
    "Wii": 10, "PS3": 11, "Xbox 360": 12, "Switch": 13, "PS5": 14
};

// ... (garder toDirectLink, window.onload, preloadData, renderMainMenu identiques) ...

function fetchGames() {
    let filtered = allGames.filter(r => (r.c[2]?.v || "").includes(currentBrand))
                             .map(r => ({ 
                                 title: r.c[0]?.v, 
                                 img: toDirectLink(r.c[6]?.v), 
                                 console: r.c[4]?.v, 
                                 owned: r.c[14]?.v 
                             }));

    // TRI PAR CONSOLE (Chronologique selon notre liste CONSOLE_ORDER)
    filtered.sort((a, b) => {
        let orderA = CONSOLE_ORDER[a.console] || 999;
        let orderB = CONSOLE_ORDER[b.console] || 999;
        return orderA - orderB;
    });

    renderGrid(filtered);
}

function renderGrid(items) {
    const view = document.getElementById('view-list');
    view.innerHTML = '<div class="game-grid"></div>';
    const grid = view.querySelector('.game-grid');

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'game-card';
        
        // Application du style si non possédé
        if(item.owned === "NON") {
            div.classList.add('not-owned');
        }

        div.onclick = () => {
            activeGameData = item;
            const card = document.getElementById('floating-card');
            card.innerHTML = `<img src="${item.img}" style="width:100%; border-radius:15px;">`;
            card.style.display = 'block';
            card.className = 'animate-zoom';
            document.getElementById('overlay').style.display = 'block';
        };
        div.innerHTML = `<img src="${item.img}">`;
        grid.appendChild(div);
    });
}

// ... (garder handleFloatingClick, closeFullDetail et closeOverlay) ...
