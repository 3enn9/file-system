import "./style.css"
interface MyFile{
    category: string;
    name: string;
    weight: number;
    weight_name: string
}

document.addEventListener("DOMContentLoaded", updateTable);

let controller: AbortController | null = null;

function updateTable(): void {
    if (controller) {
        controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;
    const loader = document.getElementById("loader");
    const fileGrid = document.querySelector(".file-grid") as HTMLElement | null;
    const params = new URLSearchParams(window.location.search);

    let root: string = params.get("root") || "/";

    const sort: string = params.get("sort") || "desc";
    const buttons = document.querySelectorAll(".button"); // Получаем все кнопки

    buttons.forEach((button) => (button as HTMLButtonElement).disabled = true);
    if (loader) loader.style.display = "block"; // Показываем индикатор
    if (fileGrid) fileGrid.classList.add("hidden"); // Блокируем клики

    fetch(`/api/fs?root=${encodeURIComponent(root)}&sort=${sort}`, { signal })
        .then((response: Response) => response.json())
        .then((data: MyFile[]) => {
            console.log(`Обновляем таблицу данными из запроса #`);
            renderTable(data, root);
        })
        .catch((error: Error) => {
            if (error.name === "AbortError") {
                console.log(`Запрос отменён`);
            } else {
                console.error(`Ошибка в запросе`, error);
            }
        })
        .finally(() => {
            buttons.forEach((button) => (button as HTMLButtonElement).disabled = false);
            if (loader) loader.style.display = "none"; // Скрываем индикатор
            if (fileGrid) fileGrid.classList.remove("hidden"); // Разблокируем клики
        });
}
// renderTable генерируем таблицу
function renderTable(files: MyFile[], root: string): void {
    const container = document.querySelector(".file-grid") as HTMLElement || null;
    const pathUrl = document.querySelector(".current-path") as HTMLElement || null;

    if (!container) {
        console.error("File grid container not found.");
        return;
    }

    container.innerHTML = "";
    pathUrl.innerHTML = `Путь ${root}`;
    files.forEach((file: MyFile): void => {
        const row = document.createElement("div");
        row.classList.add("file-grid__row");

        row.innerHTML = `
            <div class="file-grid__cell">${file.category}</div>
            <div class="file-grid__cell ${file.category === "d" ? "folder" : ""}" data-name="${file.name}">${file.name}</div>
            <div class="file-grid__cell">${file.weight}</div>
            <div class="file-grid__cell">${file.weight_name}</div>
        `;

        if (file.category === "d") {
            row.addEventListener("click", function() {
                let newRoot = root.endsWith("/") ? root + file.name : root + "/" + file.name;

                history.pushState({ root: newRoot }, "", `?root=${encodeURIComponent(newRoot)}&sort=desc`);
                updateTable();
            });

            row.style.cursor = "pointer";
        } else {
            row.style.cursor = "default";
        }

        container.appendChild(row);
    });
}


const sortAscButton = document.querySelector(".button--sort-asc") as HTMLElement | null;
const sortDescButton = document.querySelector(".button--sort-desc") as HTMLElement | null;
const backButton = document.querySelector(".button--back") as HTMLElement | null;
const statisticsButton = document.querySelector(".button--statistics") as HTMLElement | null;

// Добавляем обработчики для кнопок сортировки
if (sortAscButton && sortDescButton && backButton && statisticsButton){
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

    // Кнопка статистики
    statisticsButton.addEventListener("click", function (){
        window.location.href = "http://localhost/read_stat.php";
    })
}

// Обрабатываем изменение URL при нажатии "Назад" в браузере
window.addEventListener("popstate", function() {
    updateTable();
});