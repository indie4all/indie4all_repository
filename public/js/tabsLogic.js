// Función para cambiar de tab
function openTab(evt, tabName) {
    var i, tabContent, tabLinks;

    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    tabLinks = document.getElementsByClassName("tab-list-link");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

// Mostrar la primera pestaña por defecto
document.getElementById("profile").style.display = "block";

// Agregar eventos de clic a los enlaces de los tabs
var tabLinks = document.getElementsByClassName("tab-list-link");
for (var i = 0; i < tabLinks.length; i++) {
    tabLinks[i].addEventListener("click", function (event) {
        event.preventDefault();
        var tabName = this.getAttribute("href").substring(1);
        openTab(event, tabName);
    });
}