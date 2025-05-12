export function isDarkModeEnabled(theme: string | undefined): boolean {
	if (theme === 'dark') return true;
	if (theme === 'light') return false;
	if (theme === 'system') {
		if (typeof window !== 'undefined') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
	}
	return false;
}
