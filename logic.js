function handleFloatingClick() {
    const floating = document.getElementById('floating-card');
    const detail = document.getElementById('full-detail');
    
    // 1. On lance l'écrasement de la jaquette
    floating.classList.remove('animate-zoom'); // On retire l'anim d'entrée
    void floating.offsetWidth; // Force le rafraîchissement
    floating.classList.add('scale-out-center-ver');

    // 2. On prépare la fiche info pendant que l'autre s'écrase
    detail.innerHTML = `
        <button onclick="closeFullDetail()" style="background:var(--brand-color);color:white;border:none;padding:15px;border-radius:10px;width:100%;font-weight:bold;margin-bottom:20px;">✕ FERMER</button>
        <img src="${activeGameData.img}" style="width:100%; max-height:250px; object-fit:contain; margin-bottom:20px;">
        <h1 style="text-align:center;">${activeGameData.title}</h1>
        <div style="background:#f9f9f9; padding:20px; border-radius:15px; border:1px solid #eee;">
            <p><b>Console :</b> ${activeGameData.console}</p>
            <p><b>Prix :</b> ${activeGameData.price}€</p>
            <p><b>Statut :</b> ${activeGameData.owned}</p>
        </div>`;

    // 3. Timing : Une fois que la jaquette est écrasée (300ms), on déploie la fiche
    setTimeout(() => {
        floating.style.display = 'none'; // On fait disparaître l'image
        detail.style.display = 'block';
        detail.classList.add('scale-in-center-ver');
    }, 300); 
}

// Fonction pour fermer la fiche et l'overlay proprement
function closeFullDetail() {
    const detail = document.getElementById('full-detail');
    detail.style.display = 'none';
    detail.classList.remove('scale-in-center-ver');
    document.getElementById('overlay').style.display = 'none';
}
