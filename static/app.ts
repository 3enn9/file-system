
import { updateTable } from "./utils/updateTable"; // Импортируем функцию обновления таблицы

// Инициализация
document.addEventListener("DOMContentLoaded", updateTable);

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