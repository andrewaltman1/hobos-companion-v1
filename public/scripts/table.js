let isSorted = "Date";
const table = document.querySelector(".table-mode-container");
const thead = document.querySelector("thead");
const tableBody = document.querySelector("tbody");
const tableRows = tableBody.children;
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

document.querySelector("thead").addEventListener("click", (e) => {
  element = e.target;
  element.tagName == "TH"
    ? selectionSort(element)
    : selectionSort(element.parentElement);
});
modeButton.addEventListener("click", modeToggle);

function value(element, i) {
  let type = element.textContent.trim();
  if (type == "Date") {
    return new Date(tableRows[i].children[0].children[0].textContent);
  } else if (type == "Venue") {
    return tableRows[i].children[1].children[0].textContent;
  } else if (type == "Location") {
    return tableRows[i].children[2].children[0].textContent;
  }
}

function selectionSort(element) {
  console.log(element.textContent.trim());
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
