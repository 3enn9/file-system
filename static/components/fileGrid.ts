
import { MyFile } from "../utils/types";
import { getRootFromUrl, updateUrl } from "../utils/urlHelper";
import {updateTable} from "../utils/updateTable";

export function renderTable(files: MyFile[], root: string): void {
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
                const newRoot = root.endsWith("/") ? root + file.name : root + "/" + file.name;
                updateUrl(newRoot, "desc");
                updateTable();
            });
            row.style.cursor = "pointer";
        } else {
            row.style.cursor = "default";
        }

        container.appendChild(row);
    });
}
