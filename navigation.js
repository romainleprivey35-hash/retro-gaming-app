function openBrand(brandName) {
    document.getElementById('view-brands').style.display = 'none';
    document.getElementById('view-list').style.display = 'block';
    document.getElementById('back-btn').style.display = 'block';
    renderCategories(brandName);
}

function goBack() {
    document.getElementById('view-brands').style.display = 'flex';
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';
}

function renderCategories(brandName) {
    document.getElementById('view-list').innerHTML = `
        <h2 class="title">${brandName}</h2>
        <div class="category-pill" onclick="fetchGames('${brandName}')">JEUX</div>
        <div class="category-pill disabled">CONSOLES</div>
        <div class="category-pill disabled">ACCESSOIRES</div>
    `;
}
