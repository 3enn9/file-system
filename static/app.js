"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./style.css");
document.addEventListener("DOMContentLoaded", updateTable);
let controller = null;
function updateTable() {
    if (controller) {
        controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;
    const loader = document.getElementById("loader");
    const fileGrid = document.querySelector(".file-grid");
    const params = new URLSearchParams(window.location.search);
    let root = params.get("root") || "/";
    const sort = params.get("sort") || "desc";
    const buttons = document.querySelectorAll(".button"); // Получаем все кнопки
    buttons.forEach((button) => button.disabled = true);
    if (loader)
        loader.style.display = "block"; // Показываем индикатор
    if (fileGrid)
        fileGrid.classList.add("hidden"); // Блокируем клики
    fetch(`http://localhost:9015/api/fs?root=${encodeURIComponent(root)}&sort=${sort}`, { signal })
        .then((response) => response.json())
        .then((data) => {
        console.log(`Обновляем таблицу данными из запроса #`);
        renderTable(data, root);
    })
        .catch((error) => {
        if (error.name === "AbortError") {
            console.log(`Запрос отменён`);
        }
        else {
            console.error(`Ошибка в запросе`, error);
        }
    })
        .finally(() => {
        buttons.forEach((button) => button.disabled = false);
        if (loader)
            loader.style.display = "none"; // Скрываем индикатор
        if (fileGrid)
            fileGrid.classList.remove("hidden"); // Разблокируем клики
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
