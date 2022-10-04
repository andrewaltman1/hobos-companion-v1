(() => {
  window.addEventListener("DOMContentLoaded", (event) => {
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
      tableSort(column);
    });

  
    // Sorting function were originally condensed but runtine suffered.

    function pivotString(
      columnNum,
      tableRows,
      start = 0,
      end = tableRows.length - 1
    ) {
      const swap = (tableRows, idx1, idx2) => {
        tableBody.insertBefore(tableRows[idx2], tableRows[idx1]);
      };

      let pivot = tableRows[start].children[columnNum].children[0].textContent;
      let swapIdx = start;

      for (let i = start + 1; i <= end; i++) {
        if (pivot > tableRows[i].children[columnNum].children[0].textContent) {
          swapIdx++;
          swap(tableRows, swapIdx, i);
        }
      }

      swap(tableRows, swapIdx + 1, start);
      return swapIdx;
    }

    function quickSortString(
      columnNum,
      tableRows,
      left = 0,
      right = tableRows.length - 1
    ) {
      if (left < right) {
        let pivotIndex = pivotString(columnNum, tableRows, left, right);
        quickSortString(columnNum, tableRows, left, pivotIndex - 1);
        quickSortString(columnNum, tableRows, pivotIndex + 1, right);
      }
      return tableRows;
    }

    function pivotNumber(
      columnNum,
      tableRows,
      start = 0,
      end = tableRows.length - 1
    ) {
      const swap = (tableRows, idx1, idx2) => {
        tableBody.insertBefore(tableRows[idx2], tableRows[idx1]);
      };

      let pivot = +tableRows[start].children[columnNum].children[0].textContent;
      let swapIdx = start;

      for (let i = start + 1; i <= end; i++) {
        if (pivot > +tableRows[i].children[columnNum].children[0].textContent) {
          swapIdx++;
          swap(tableRows, swapIdx, i);
        }
      }

      swap(tableRows, swapIdx + 1, start);
      return swapIdx;
    }

    function quickSortNumber(
      columnNum,
      tableRows,
      left = 0,
      right = tableRows.length - 1
    ) {
      if (left < right) {
        let pivotIndex = pivotNumber(columnNum, tableRows, left, right);
        quickSortNumber(columnNum, tableRows, left, pivotIndex - 1);
        quickSortNumber(columnNum, tableRows, pivotIndex + 1, right);
      }
      return tableRows;
    }

    function pivotDate(
      columnNum,
      tableRows,
      start = 0,
      end = tableRows.length - 1
    ) {
      const swap = (tableRows, idx1, idx2) => {
        tableBody.insertBefore(tableRows[idx2], tableRows[idx1]);
      };

      let pivot = new Date(
        tableRows[start].children[columnNum].children[0].textContent
      );
      let swapIdx = start;

      for (let i = start + 1; i <= end; i++) {
        if (
          pivot >
          new Date(tableRows[i].children[columnNum].children[0].textContent)
        ) {
          swapIdx++;
          swap(tableRows, swapIdx, i);
        }
      }

      swap(tableRows, swapIdx + 1, start);
      return swapIdx;
    }

    function quickSortDate(
      columnNum,
      tableRows,
      left = 0,
      right = tableRows.length - 1
    ) {
      if (left < right) {
        let pivotIndex = pivotDate(columnNum, tableRows, left, right);
        quickSortDate(columnNum, tableRows, left, pivotIndex - 1);
        quickSortDate(columnNum, tableRows, pivotIndex + 1, right);
      }
      return tableRows;
    }

    function tableSort(column) {
      if (isSorted == column.id) {
        reverse();
      } else {
        let columnNum = column.id.at(-1);
        let columnType = window.columnTypes.at(columnNum);
        columnType == "s"
          ? quickSortString(columnNum, tableRows)
          : columnType == "n"
          ? quickSortNumber(columnNum, tableRows)
          : quickSortDate(columnNum, tableRows);
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
