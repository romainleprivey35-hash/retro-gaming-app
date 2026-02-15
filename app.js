function openBrand(brandName) {
    document.getElementById('view-brands').style.display = 'none';
    document.getElementById('view-list').style.display = 'block';
    document.getElementById('back-btn').style.display = 'block';
    document.getElementById('view-list').innerHTML = `<h2 style="text-align:center; color:white; margin-top:50px;">Collection ${brandName}</h2>`;
}

function goBack() {
    document.getElementById('view-brands').style.display = 'flex';
    document.getElementById('view-list').style.display = 'none';
    document.getElementById('back-btn').style.display = 'none';
}
