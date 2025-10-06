import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import { CSPostHogProvider } from "./providers";

import Header from "@/components/ui/header";

export const metadata: Metadata = {
  title: "Pal | AI Chatbot",
  description:
    "An AI chatbot that can perform functions like searching the web, getting the weather, and finding the latest news.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <CSPostHogProvider>
        <body className={`${GeistSans.className} h-dvh overflow-hidden`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}
            <Analytics />
          </ThemeProvider>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
