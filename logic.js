// ... (Garder preloadData, selectBrand, fetchGames etc. identiques) ...

let activeGameData = null;

function handleCardClick(imgSrc, data) {
    activeGameData = data;
    const overlay = document.getElementById('overlay');
    const container = document.getElementById('flip-container');
    
    container.innerHTML = `
        <div class="side front"><img src="${imgSrc}" style="width:100%;"></div>
        <div class="side back" style="padding:20px; box-sizing:border-box;">
            <button onclick="closeEverything()" style="background:var(--brand-color);color:white;border:none;padding:15px;border-radius:10px;width:100%;font-weight:bold;margin-bottom:20px;">✕ FERMER</button>
            <img src="${imgSrc}" style="width:100%; max-height:150px; object-fit:contain;">
            <h1 style="font-size:1.5em; text-align:center;">${data.title}</h1>
            <p><b>Console :</b> ${data.console}</p>
            <p><b>Prix :</b> ${data.price}€</p>
            <p><b>Statut :</b> ${data.owned}</p>
        </div>
    `;
    
    overlay.style.display = 'block';
    container.style.display = 'block';
    
    setTimeout(() => { container.classList.add('zoom'); }, 10);
}

function handleFloatingClick() {
    const container = document.getElementById('flip-container');
    
    // 1. Petit rebond tactile
    container.classList.add('bounce');
    
    // 2. À 50% du rebond, on déclenche la rotation "Fusion"
    setTimeout(() => {
        container.classList.remove('bounce');
        container.classList.add('fusion');
    }, 200);
}

function closeEverything() {
    const overlay = document.getElementById('overlay');
    const container = document.getElementById('flip-container');
    
    container.style.transform = "translate(-50%, -50%) scale(0) rotateY(0deg)";
    setTimeout(() => {
        overlay.style.display = 'none';
        container.style.display = 'none';
        container.classList.remove('zoom', 'fusion');
    }, 600);
}

// Dans tes fonctions fetchGamesByBrand, fetchConsoles etc. 
// Remplace juste la div floating-card par :
// <div id="overlay" onclick="closeEverything()"></div>
// <div id="flip-container" onclick="event.stopPropagation(); handleFloatingClick()"></div>
