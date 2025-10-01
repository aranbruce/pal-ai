import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";
import { CSPostHogProvider } from "./providers";

import Header from "@/components/header";

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
    <html lang="en" className="bg-white dark:bg-zinc-950">
      <CSPostHogProvider>
        <body className={`${GeistSans.className} h-dvh overflow-hidden`}>
          <Header />
          {children}
          <Analytics />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
