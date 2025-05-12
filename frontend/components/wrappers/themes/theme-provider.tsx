"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) {
	// No need for state management here since we're using suppressHydrationWarning on html
	return (
		<NextThemesProvider 
			{...props} 
			disableTransitionOnChange
			storageKey="theme"
		>
			{children}
		</NextThemesProvider>
	);
}
