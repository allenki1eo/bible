import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeBackground } from "@/components/theme-background";
import { ToastProvider } from "@/components/toast";
import { ServiceWorkerRegistration } from "@/components/sw-registration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nuru — Grow in faith, together",
  description:
    "A spiritually-centered community and personal growth platform with devotionals, AI bedtime stories, and a testimony wall.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nuru",
  },
  icons: {
    icon: [
      { url: "/logos/light.png", media: "(prefers-color-scheme: light)" },
      { url: "/logos/dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: [
      { url: "/logos/light.png", media: "(prefers-color-scheme: light)" },
      { url: "/logos/dark.png", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logos/light.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nuru" />
      </head>
      <body className="min-h-screen font-sans antialiased bg-transparent">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <ThemeBackground />
            <ServiceWorkerRegistration />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
