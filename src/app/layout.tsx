import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PwaRegister } from "@/components/PwaRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "El Proceso — Gym Tracker",
  description: "Tu app de entrenamiento personal con seguimiento inteligente",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "El Proceso",
  },
  icons: {
    icon: "/assets/images/favicon.png",
    apple: "/assets/images/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a100d" },
    { media: "(prefers-color-scheme: light)", color: "#eeede5" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/assets/images/favicon.png"
        />
        <link
          rel="apple-touch-icon"
          href="/assets/images/favicon.png"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${mono.variable} font-sans min-h-screen text-body-md selection:bg-primary/20 selection:text-primary`}
      >
        <ThemeProvider>
          <PwaRegister />
          {/* Layout: sidebar (desktop) + main content area */}
          <div className="flex flex-col md:flex-row min-h-screen">
            <Navigation />
            <main
              id="app-root"
              className="flex-1 min-w-0 pb-24 md:pb-0"
            >
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
