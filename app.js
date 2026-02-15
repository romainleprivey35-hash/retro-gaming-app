function openBrand(brandName) {
    // 1. Cacher le menu principal
    document.getElementById('view-brands').style.display = 'none';
    
    // 2. Afficher la zone de liste et le bouton retour
    const viewList = document.getElementById('view-list');
    viewList.style.display = 'block';
    document.getElementById('back-btn').style.display = 'block';
    
    // 3. Créer le titre et les boutons de catégories
    viewList.innerHTML = `
        <h2 style="text-align:center; color:white; margin-bottom:30px;">${brandName}</h2>
        
        <div class="category-pill" onclick="alert('Bientôt : Liste des Jeux')">JEUX</div>
        <div class="category-pill" onclick="alert('Bientôt : Liste des Consoles')">CONSOLES</div>
        <div class="category-pill" onclick="alert('Bientôt : Liste des Accessoires')">ACCESSOIRES</div>
    `;
}

function goBack() {
    document.getElementById('view-brands').style.display = 'flex';
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';
}
