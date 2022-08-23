(() => {
  window.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    const tableBody = document.querySelector("tbody");
    const tableRows = tableBody.children;
    let isSorted = "# played";
    document.querySelector("thead").addEventListener("click", (e) => {
      e.target.tagName == "TH" ? selectionSort(e) : "";
    });

    function value(e, i) {
      let type = e.target.textContent.trim();
      if (type == "Title") {
        return tableRows[i].children[0].children[0].textContent;
      } else if (type == "Writer") {
        return tableRows[i].children[1].textContent;
      } else if (type == "# played") {
        return new Number(tableRows[i].children[2].textContent);
      }
    }

    function selectionSort(e) {
      if (isSorted == e.target.textContent.trim()) {
        reverse();
      } else {
        for (let i = 0; i < tableRows.length; i++) {
          let min = i;
          for (let j = i + 1; j < tableRows.length; j++) {
            if (value(e, j) < value(e, min)) {
              min = j;
            }
          }
          if (i !== min) {
            tableBody.insertBefore(tableRows[min], tableRows[i]);
          }
        }
        isSorted = e.target.textContent.trim();
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
