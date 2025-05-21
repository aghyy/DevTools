import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppLayout } from "./app-layout";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "@/components/wrappers/themes/theme-provider";
import { PerformanceTracker } from "@/components/performance-tracker";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DevTools",
  description: "Developer Tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="About Me" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-none no-scrollbar scroll-smooth`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <JotaiProvider>
            <AppLayout>
              {children}
              <PerformanceTracker />
            </AppLayout>
          </JotaiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
