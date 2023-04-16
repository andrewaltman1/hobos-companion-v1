(() => {
    window.addEventListener("DOMContentLoaded", () => {
      document.querySelector("#view-mode-button").classList.toggle("hide");
      document
        .querySelector(".table-mode-container")
        .classList.toggle("center-children");
      document.querySelector("h3").style.display = "none";
    });
  })();