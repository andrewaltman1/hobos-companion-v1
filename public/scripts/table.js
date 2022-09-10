let isSorted = "table-column-1";
const table = document.querySelector(".table-mode-container");
const thead = document.querySelector("thead");
const tableBody = document.querySelector("tbody");
const tableRows = tableBody.children;
const tableData = (i) => {
  return tableRows[i].children[0].children[0].textContent;
};

let element;
  
document.querySelector("thead").addEventListener("click", (e) => {
  e.target.tagName == "TH"
    ? (column = e.target)
    : (column = e.target.parentElement);
    let type = element.textContent.trim();
  selectionSort(column, type);
});
modeButton.addEventListener("click", modeToggle);

function tableData(type, i) {
  return tableRows[i].children[0].children[0].textContent;
};

function value(element, i) {
  let column = element.id;
  if (column == "table-column-1") {
    tableDataOne(i);
  } else if (column == "table-column-2") {
    tableDataTwo(i);
  } else if (column == "table-column-3") {
    tableDataThree(i);
  }
}

function selectionSort(column) {
  if (isSorted == column.id) {
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
    isSorted = element.id;
  }
}

function reverse() {
  let i = tableRows.length - 1;
  for (let j = 0; j <= i - 1; j++) {
    tableBody.insertBefore(tableRows[i], tableRows[j]);
  }
}

const observer = new IntersectionObserver(
  ([e]) =>
    e.target.classList.toggle(
      "table-mode-container__thead--no-transparency",
      e.intersectionRatio < 1
    ),
  { threshold: [1] }
);
observer.observe(thead);
