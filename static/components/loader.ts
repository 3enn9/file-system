
export function showLoader(loader: HTMLElement | null) {
    if (loader) {
        loader.style.display = "block";
    }
}

export function hideLoader(loader: HTMLElement | null) {
    if (loader) {
        loader.style.display = "none";
    }
}
