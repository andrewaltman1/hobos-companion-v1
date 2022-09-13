(() => {
  window.addEventListener("DOMContentLoaded",
    (event) => {
        console.log("shared script");
        const table = document.querySelector(".table-mode-container");
        const mapContainer = document.querySelector("#cluster-map");
        const modeButton = document.getElementById("view-mode-button");
        modeButton.addEventListener("click", modeToggle);
        function mapMode() {
          !table.classList.contains("hide") ? table.classList.toggle("hide") : "";
          mapContainer.classList.contains("hide")
            ? mapContainer.classList.toggle("hide")
            : "";
          modeButton.textContent = "Table Mode";
          sessionStorage.setItem("viewMode", "map");
        }
        function tableMode() {
          !mapContainer.classList.contains("hide")
            ? mapContainer.classList.toggle("hide")
            : "";
          table.classList.contains("hide") ? table.classList.toggle("hide") : "";
          modeButton.textContent = "Map Mode";
          sessionStorage.setItem("viewMode", "table");
        }
  
        function modeToggle() {
          sessionStorage.getItem("viewMode") == "map" ? tableMode() : mapMode();
        }
  
        (function initMap() {
          if (!sessionStorage.getItem("viewMode")) {
            mapMode();
          } else {
            sessionStorage.getItem("viewMode") == "map" ? mapMode() : tableMode();
          }
        })();
  
    });
})();

