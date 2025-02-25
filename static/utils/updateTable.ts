
import { fetchFiles } from "../api/fileService";
import { renderTable } from "../components/fileGrid";
import { showLoader, hideLoader } from "../components/loader";
import { getRootFromUrl, getSortFromUrl, updateUrl } from "./urlHelper";
import { MyFile } from "./types";

let controller: AbortController | null = null;

export function updateTable(): void {
    if (controller) {
        controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;

    const loader = document.getElementById("loader");
    const fileGrid = document.querySelector(".file-grid") as HTMLElement | null;

    let root = getRootFromUrl();
    let sort = getSortFromUrl();

    const buttons = document.querySelectorAll(".button");
    buttons.forEach((button) => (button as HTMLButtonElement).disabled = true);

    showLoader(loader);
    if (fileGrid) fileGrid.classList.add("hidden");

    fetchFiles(root, sort, signal)
        .then((data: MyFile[]) => {
            renderTable(data, root);
        })
        .catch((error: Error) => {
            if (error.name !== "AbortError") {
                console.error("Ошибка в запросе", error);
            }
        })
        .finally(() => {
            buttons.forEach((button) => (button as HTMLButtonElement).disabled = false);
            hideLoader(loader);
            if (fileGrid) fileGrid.classList.remove("hidden");
        });
}
