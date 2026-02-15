// Remplace cette URL par TON lien Google Sheets (en t'assurant qu'il est en "Partage public")
const SHEET_URL = "TON_LIEN_GOOGLE_SHEET_ICI";

function openBrand(brandName) {
    document.getElementById('view-brands').style.display = 'none';
    const viewList = document.getElementById('view-list');
    viewList.style.display = 'block';
    document.getElementById('back-btn').style.display = 'block';
    
    // On affiche un message de chargement
    viewList.innerHTML = `<h2 style="text-align:center; color:white;">Chargement de ${brandName}...</h2>`;
    
    // Pour l'instant on garde nos boutons de test, mais on prépare la suite
    setTimeout(() => {
        renderCategories(brandName);
    }, 500); 
}

function renderCategories(brandName) {
    const viewList = document.getElementById('view-list');
    viewList.innerHTML = `
        <h2 style="text-align:center; color:white; margin-bottom:30px;">${brandName}</h2>
        <div class="category-pill" onclick="loadData('${brandName}', 'Jeux')">JEUX</div>
        <div class="category-pill" onclick="loadData('${brandName}', 'Consoles')">CONSOLES</div>
        <div class="category-pill" onclick="loadData('${brandName}', 'Accessoires')">ACCESSOIRES</div>
    `;
}

function loadData(brand, category) {
    alert("Connexion au Sheets pour : " + brand + " / " + category);
    // C'est ici qu'on ajoutera le code pour aspirer tes lignes Google Sheets à l'étape suivante
}

function goBack() {
    document.getElementById('view-brands').style.display = 'flex';
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';
}
