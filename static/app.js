"use strict";
document.addEventListener("DOMContentLoaded", updateTable);
let controller = null;
let lastRequestId = 0; // ID последнего запроса
function updateTable() {
    if (controller) {
        controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;
    const requestId = ++lastRequestId; // Увеличиваем ID запроса
    const params = new URLSearchParams(window.location.search);
    let root = params.get("root") || "/";
    const sort = params.get("sort") || "desc";
    fetch(`/api/fs?root=${encodeURIComponent(root)}&sort=${sort}`, { signal })
        .then((response) => response.json())
        .then((data) => {
        if (requestId !== lastRequestId) {
            console.log(`Пропускаем устаревший запрос #${requestId}`);
            return; // Если это не последний запрос, пропускаем его
        }
        console.log(`Обновляем таблицу данными из запроса #${requestId}`);
        renderTable(data, root);
    })
        .catch((error) => {
        if (error.name === "AbortError") {
            console.log(`Запрос #${requestId} отменён`);
        }
        else {
            console.error(`Ошибка в запросе #${requestId}:`, error);
        }
    });
}
// renderTable генерируем таблицу
function renderTable(files, root) {
    const container = document.querySelector(".file-grid") || null;
    const pathUrl = document.querySelector(".current-path") || null;
    if (!container) {
        console.error("File grid container not found.");
        return;
    }
    container.innerHTML = "";
    pathUrl.innerHTML = `Путь ${root}`;
    files.forEach((file) => {
        const row = document.createElement("div");
        row.classList.add("file-grid__row");
        row.innerHTML = `
            <div class="file-grid__cell">${file.category}</div>
            <div class="file-grid__cell ${file.category === "d" ? "folder" : ""}" data-name="${file.name}">${file.name}</div>
            <div class="file-grid__cell">${file.weight}</div>
            <div class="file-grid__cell">${file.weight_name}</div>
        `;
        if (file.category === "d") {
            row.addEventListener("click", function () {
                let newRoot = root.endsWith("/") ? root + file.name : root + "/" + file.name;
                history.pushState({ root: newRoot }, "", `?root=${encodeURIComponent(newRoot)}&sort=desc`);
                updateTable();
            });
            row.style.cursor = "pointer";
        }
        else {
            row.style.cursor = "default";
        }
        container.appendChild(row);
    });
}
const sortAscButton = document.querySelector(".button--sort-asc");
const sortDescButton = document.querySelector(".button--sort-desc");
const backButton = document.querySelector(".button--back");
// Добавляем обработчики для кнопок сортировки
if (sortAscButton && sortDescButton && backButton) {
    sortAscButton.addEventListener("click", function () {
        const params = new URLSearchParams(window.location.search);
        let root = params.get("root") || "/"; // Получаем актуальный root из URL
        history.pushState({ root: root }, "", `?root=${encodeURIComponent(root)}&sort=asc`);
        updateTable();
    });
    sortDescButton.addEventListener("click", function () {
        const params = new URLSearchParams(window.location.search);
        let root = params.get("root") || "/"; // Получаем актуальный root из URL
        history.pushState({ root: root }, "", `?root=${encodeURIComponent(root)}&sort=desc`);
        updateTable();
    });
    // Кнопка назад
    backButton.addEventListener("click", function () {
        const params = new URLSearchParams(window.location.search);
        let root = params.get("root") || "/";
        let newRoot = root.split("/").slice(0, -1).join("/");
        if (newRoot === "") {
            newRoot = "/";
        }
        history.pushState({ root: newRoot }, "", `?root=${encodeURIComponent(newRoot)}&sort=desc`);
        updateTable();
    });
}
// Обрабатываем изменение URL при нажатии "Назад" в браузере
window.addEventListener("popstate", function () {
    updateTable();
});
