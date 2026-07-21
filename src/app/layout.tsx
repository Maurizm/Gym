import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GymApp - Procesos",
  description: "App de entrenamiento para el gimnasio",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e0f0d",
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
    <html lang="es" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} min-h-screen flex flex-col pb-32 font-body-md text-body-md selection:bg-primary-container selection:text-on-primary-container`}
      >
        <Navigation />
        <main id="app-root" className="max-w-7xl mx-auto w-full flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
