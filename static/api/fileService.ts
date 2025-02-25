
import { MyFile } from "../utils/types"; // Тип для файлов

export async function fetchFiles(root: string, sort: string, signal: AbortSignal): Promise<MyFile[]> {
    const response = await fetch(`/api/fs?root=${encodeURIComponent(root)}&sort=${sort}`, { signal });

    if (!response.ok) {
        throw new Error('Ошибка при загрузке данных');
    }

    return response.json();
}
