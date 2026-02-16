// ... (On garde tes fonctions de fetch et preload habituelles) ...

function handleCardClick(imgSrc, data) {
    activeGameData = data;
    const overlay = document.getElementById('overlay');
    const floating = document.getElementById('floating-card');
    floating.innerHTML = `<img src="${imgSrc}">`;
    floating.className = ''; 
    overlay.style.display = 'block';
    floating.style.display = 'block';
    void floating.offsetWidth; 
    floating.classList.add('animate-zoom');
}

function handleFloatingClick() {
    const floating = document.getElementById('floating-card');
    const detail = document.getElementById('full-detail');
    
    // 1. On lance le rebond
    floating.classList.add('bounce');
    
    // 2. À 50% du rebond (200ms), on enchaîne la rotation de fusion
    setTimeout(() => {
        // Préparation de la fiche info
        detail.innerHTML = `
            <button onclick="document.getElementById('full-detail').classList.remove('open'); setTimeout(()=>document.getElementById('full-detail').style.display='none', 600)" style="background:var(--brand-color);color:white;border:none;padding:15px;border-radius:10px;width:100%;font-weight:bold;margin-bottom:20px;">✕ FERMER</button>
            <img src="${activeGameData.img}" style="width:100%; max-height:250px; object-fit:contain; margin-bottom:20px;">
            <h1 style="text-align:center;">${activeGameData.title}</h1>
            <div style="background:#f9f9f9; padding:20px; border-radius:15px; border:1px solid #eee;">
                <p><b>Console :</b> ${activeGameData.console}</p>
                <p><b>Prix :</b> ${activeGameData.price}€</p>
                <p><b>Statut :</b> ${activeGameData.owned}</p>
            </div>`;
        
        // On remplace l'animation par la fusion
        floating.classList.remove('bounce');
        void floating.offsetWidth;
        floating.classList.add('fusion-out');
        
        // On affiche la fiche info en fondu
        detail.style.display = 'block';
        setTimeout(() => { detail.classList.add('open'); }, 100);

        // Nettoyage après l'effet
        setTimeout(() => {
            document.getElementById('overlay').style.display = 'none';
            floating.style.display = 'none';
        }, 1200);
    }, 200); 
}

function closeOverlay() {
    const floating = document.getElementById('floating-card');
    floating.className = 'animate-reverse';
    setTimeout(() => {
        document.getElementById('overlay').style.display = 'none';
        floating.style.display = 'none';
    }, 600);
}

// RESTAURATION DES FONCTIONS FETCH (Structure simple)
async function fetchGamesByBrand() {
    const view = document.getElementById('view-list');
    // On réinjecte les conteneurs dont on a besoin
    view.innerHTML = `
        <div id="overlay" onclick="closeOverlay()"></div>
        <div id="floating-card" onclick="event.stopPropagation(); handleFloatingClick()"></div>
        <div id="full-detail"></div>
        <div class="sticky-header"><button onclick="showCategories()">⬅ Retour</button></div>
        <h2 style="text-align:center;margin-top:80px;">JEUX</h2>`;
    
    if (allGames.length === 0) await preloadData();
    // ... reste de ta logique de boucle pour afficher les jeux ...
    // (Utilise bien card.onclick = () => handleCardClick(g.img, g);)
}
