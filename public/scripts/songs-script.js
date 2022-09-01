(() => {
  window.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    const tableBody = document.querySelector("tbody");
    const tableRows = tableBody.children;
    const thead = document.querySelector("thead");
    let isSorted = "Plays";
    let element;
    
    const observer = new IntersectionObserver(
      ([e]) =>
        e.target.classList.toggle(
          "table-mode-container__thead--no-transparency",
          e.intersectionRatio < 1
        ),
      { threshold: [1] }
    );
    observer.observe(thead);

    thead.addEventListener("click", (e) => {
      element = e.target;
      element.tagName == "TH" ? selectionSort(element) : selectionSort(element.parentElement);
    });

    function value(element, i) {
      let type = element.textContent.trim();
      if (type == "Title") {
        return tableRows[i].children[0].children[0].textContent;
      } else if (type == "Writer") {
        return tableRows[i].children[1].textContent;
      } else if (type == "Plays") {
        return new Number(tableRows[i].children[2].textContent);
      }
    }

    function selectionSort(element) {
      if (isSorted == element.textContent.trim()) {
        reverse();
      } else {
        for (let i = 0; i < tableRows.length; i++) {
          let min = i;
          for (let j = i + 1; j < tableRows.length; j++) {
            if (value(element, j) < value(element, min)) {
              min = j;
            }
          }
          if (i !== min) {
            tableBody.insertBefore(tableRows[min], tableRows[i]);
          }
        }
        isSorted = element.textContent.trim();
      }
    }

    function reverse() {
      let i = tableRows.length - 1;
      for (let j = 0; j <= i - 1; j++) {
        tableBody.insertBefore(tableRows[i], tableRows[j]);
      }
    }

    document.querySelector("#view-mode-button").classList.toggle("hide");
  });
})();
