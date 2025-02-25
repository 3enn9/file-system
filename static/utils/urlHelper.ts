
export function getRootFromUrl(): string {
    const params = new URLSearchParams(window.location.search);
    return params.get("root") || "/";
}

export function getSortFromUrl(): string {
    const params = new URLSearchParams(window.location.search);
    return params.get("sort") || "desc";
}

export function updateUrl(newRoot: string, sort: string) {
    history.pushState({ root: newRoot }, "", `?root=${encodeURIComponent(newRoot)}&sort=${sort}`);
}
