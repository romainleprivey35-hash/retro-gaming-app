// ... (garder CONSOLE_ORDER et les autres fonctions) ...

function renderGrid(items) {
    const view = document.getElementById('view-list');
    view.innerHTML = '<div class="game-grid"></div>';
    const grid = view.querySelector('.game-grid');
    
    let lastConsole = "";

    items.forEach(item => {
        // AJOUT DU MUR VIRTUEL SI LA CONSOLE CHANGE
        if (item.console !== lastConsole) {
            const separator = document.createElement('div');
            separator.className = 'console-separator';
            separator.innerText = item.console;
            grid.appendChild(separator);
            lastConsole = item.console;
        }

        const div = document.createElement('div');
        div.className = 'game-card';
        if(item.owned === "NON") div.classList.add('not-owned');

        div.onclick = () => {
            activeGameData = item;
            const card = document.getElementById('floating-card');
            // On vide le contenu précédent pour éviter les doublons en bas
            card.innerHTML = `<img src="${item.img}" style="width:100%; border-radius:15px; display:block;">`;
            card.style.display = 'block';
            card.className = 'animate-zoom';
            document.getElementById('overlay').style.display = 'block';
        };
        
        div.innerHTML = `<img src="${item.img}">`;
        grid.appendChild(div);
    });
}

// Nettoyage de la fonction click pour éviter l'affichage fantôme
function handleFloatingClick() {
    const detail = document.getElementById('full-detail');
    document.getElementById('floating-card').classList.add('scale-out-ver-center');
    
    setTimeout(() => {
        document.getElementById('floating-card').style.display = 'none';
        detail.innerHTML = `
            <button onclick="closeFullDetail()" style="position:absolute; top:20px; background:var(--brand-color); color:white; border:none; padding:15px; border-radius:10px; width:80%;">✕ FERMER</button>
            <img src="${activeGameData.img}" style="max-height:40%; border-radius:10px; margin-bottom:20px;">
            <h2 style="text-align:center;">${activeGameData.title}</h2>
            <p><b>Console :</b> ${activeGameData.console}</p>`;
        detail.className = 'scale-in-ver-center';
    }, 400);
}
