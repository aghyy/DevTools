export const isDarkModeEnabled = (): boolean => {
    return document.body.classList.contains('dark');
};