(() => {
  window.addEventListener("DOMContentLoaded",
    (event) => {
      console.log("table script");
      let isSorted = "table-column-0";
      const thead = document.querySelector("thead");
      const tableBody = document.querySelector("tbody");
      const tableRows = tableBody.children;
      let column;

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
        e.target.tagName == "TH"
          ? (column = e.target)
          : (column = e.target.parentElement);
        measurePerf();
      });

      async function measurePerf() {
        let startTime = performance.now();
        await tableSort(column);
        let endTime = performance.now();
        console.log(
          `tableSort comapre functions ${column.id} took ${
            endTime - startTime
          } milliseconds`
        );
      }

      function stringCompare(columnNum) {
        for (let i = 0; i < tableRows.length; i++) {
          let min = i;
          for (let j = i + 1; j < tableRows.length; j++) {
            if (
              tableRows[j].children[columnNum].children[0].textContent <
              tableRows[min].children[columnNum].children[0].textContent
            ) {
              min = j;
            }
          }
          if (i !== min) {
            tableBody.insertBefore(tableRows[min], tableRows[i]);
          }
        }
      }

      function numberCompare(columnNum) {
        for (let i = 0; i < tableRows.length; i++) {
          let min = i;
          for (let j = i + 1; j < tableRows.length; j++) {
            if (
              +tableRows[j].children[columnNum].children[0].textContent <
              +tableRows[min].children[columnNum].children[0].textContent
            ) {
              min = j;
            }
          }
          if (i !== min) {
            tableBody.insertBefore(tableRows[min], tableRows[i]);
          }
        }
      }

      function dateCompare(columnNum) {
        for (let i = 0; i < tableRows.length; i++) {
          let min = i;
          for (let j = i + 1; j < tableRows.length; j++) {
            if (
              new Date(
                tableRows[j].children[columnNum].children[0].textContent
              ) <
              new Date(
                tableRows[min].children[columnNum].children[0].textContent
              )
            ) {
              min = j;
            }
          }
          if (i !== min) {
            tableBody.insertBefore(tableRows[min], tableRows[i]);
          }
        }
      }

      function tableSort(column) {
        if (isSorted == column.id) {
          reverse();
        } else {
          let columnNum = column.id.at(-1);
          let columnType = window.columnTypes.at(columnNum);
          columnType == "s"
            ? stringCompare(columnNum)
            : columnType == "n"
            ? numberCompare(columnNum)
            : dateCompare(columnNum);
          isSorted = column.id;
        }
      }

      function reverse() {
        let i = tableRows.length - 1;
        for (let j = 0; j <= i - 1; j++) {
          tableBody.insertBefore(tableRows[i], tableRows[j]);
        }
      }
    });
})();
