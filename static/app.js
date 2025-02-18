document.addEventListener("DOMContentLoaded", updateTable);

function updateTable() {
  const params = new URLSearchParams(window.location.search);
  let root = params.get("root") || "/";
  const sort = params.get("sort") || "desc";

  fetch(`/api/fs?root=${encodeURIComponent(root)}&sort=${sort}`)
    .then(response => response.json())
    .then(data => {
      console.log("Полученные данные:", data);
      renderTable(data, root);
    })
    .catch(error => console.error("Ошибка при получении данных:", error));
}
 
function renderTable(files, root) {
  const tableBody = document.querySelector(".file-table tbody");
  tableBody.innerHTML = "";

  files.forEach(file => {
    const row = document.createElement("tr");
    row.classList.add("table-row");

    row.innerHTML = `
      <td class="table-cell">${file.category}</td>
      <td class="table-cell ${file.category === "d" ? "folder" : ""}" data-name="${file.name}">${file.name}</td>
      <td class="table-cell">${file.weight}</td>
      <td class="table-cell">${file.weight_name}</td>
    `;

    if (file.category === "d") {
      row.addEventListener("click", function() {
          let newRoot = root.endsWith("/") ? root + file.name : root + "/" + file.name;

          // Меняем URL без перезагрузки страницы
          history.pushState({ root: newRoot }, "", `?root=${encodeURIComponent(newRoot)}&sort=desc`);

          // Загружаем новые данные
          updateTable();
      });

      row.style.cursor = "pointer"; // Делаем курсор pointer только для папок
  } else {
      row.style.cursor = "default"; // Для файлов обычный курсор
  }

  tableBody.appendChild(row);
  });
}

const sortAscButton = document.querySelector(".button--sort-asc");
const sortDescButton = document.querySelector(".button--sort-desc");
const backButton = document.querySelector(".button--back");

// Добавляем обработчики для кнопок сортировки
sortAscButton.addEventListener("click", function() {
  const params = new URLSearchParams(window.location.search);
  let root = params.get("root") || "/";  // Получаем актуальный root из URL
  history.pushState({ root: root }, "", `?root=${encodeURIComponent(root)}&sort=asc`);
  updateTable();
});


sortDescButton.addEventListener("click", function() {
  const params = new URLSearchParams(window.location.search);
  let root = params.get("root") || "/";  // Получаем актуальный root из URL
  history.pushState({ root: root }, "", `?root=${encodeURIComponent(root)}&sort=desc`);
  updateTable();
});

// Кнопка назад
backButton.addEventListener("click", function(){
  const params = new URLSearchParams(window.location.search);
  let root = params.get("root") || "/";
  let newRoot = root.split("/").slice(0, -1).join("/")

  if (newRoot === "") {
    newRoot = "/";
  }
  history.pushState({ root: newRoot }, "", `?root=${encodeURIComponent(newRoot)}&sort=desc`);
  
  updateTable();

});

// Обрабатываем изменение URL при нажатии "Назад" в браузере
window.addEventListener("popstate", function(event) {
  updateTable();
});