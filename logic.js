function handleFloatingClick() {
    const floating = document.getElementById('floating-card');
    const detail = document.getElementById('full-detail');
    
    // 1. On écrase la jaquette
    floating.classList.add('scale-out-ver-center');

    setTimeout(() => {
        // 2. On prépare le contenu de la fiche
        detail.innerHTML = `
            <button onclick="closeFullDetail()" style="background:var(--brand-color);color:white;border:none;padding:15px;border-radius:10px;width:100%;font-weight:bold;margin-bottom:20px;position:absolute;top:20px;left:0;">✕ FERMER</button>
            <img src="${activeGameData.img}" style="max-width:80%; max-height:35vh; object-fit:contain; border-radius:10px;">
            <h1 style="text-align:center; margin-top:20px;">${activeGameData.title}</h1>
            <div style="background:#f4f4f4; padding:20px; border-radius:15px; width:100%;">
                <p><b>Console :</b> ${activeGameData.console}</p>
                <p><b>Prix :</b> ${activeGameData.price}€</p>
                <p><b>Possédé :</b> ${activeGameData.owned}</p>
            </div>`;
        
        floating.style.display = 'none';
        
        // 3. On lance l'animation de dépliage de la fiche
        detail.className = ''; // On vide les anciennes classes
        void detail.offsetWidth; // Force le refresh
        detail.classList.add('scale-in-ver-center');
    }, 400);
}

function closeFullDetail() {
    const detail = document.getElementById('full-detail');
    const viewList = document.getElementById('view-list');
    const overlay = document.getElementById('overlay');

    // 1. La fiche s'écrase
    detail.classList.remove('scale-in-ver-center');
    void detail.offsetWidth;
    detail.classList.add('scale-out-ver-center');
    overlay.classList.remove('active');

    setTimeout(() => {
        detail.style.display = 'none';
        overlay.style.display = 'none';
        
        // 2. La liste de produits se déploie (ton effet rideau)
        viewList.classList.remove('scale-in-ver-center');
        void viewList.offsetWidth;
        viewList.classList.add('scale-in-ver-center');
        
        document.getElementById('ui-header').style.display = 'block'; 
        toggleScroll(false);
    }, 500);
}

// Modifie aussi handleCardClick pour être sûr que tout est propre au départ
function handleCardClick(imgSrc, data) {
    activeGameData = data;
    document.getElementById('ui-header').style.display = 'none';
    toggleScroll(true);
    
    const overlay = document.getElementById('overlay');
    const floating = document.getElementById('floating-card');
    const viewList = document.getElementById('view-list');

    // Reset complet des animations précédentes
    viewList.classList.remove('scale-in-ver-center');
    floating.className = ''; 
    
    floating.innerHTML = `<img src="${imgSrc}">`;
    overlay.style.display = 'block';
    setTimeout(() => overlay.classList.add('active'), 10);
    
    floating.style.display = 'block';
    void floating.offsetWidth; 
    floating.classList.add('animate-zoom');
}
