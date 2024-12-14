import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import { CSPostHogProvider } from "./providers";

import Header from "@/components/header";
import { AI } from "@/app/ai";

export const metadata: Metadata = {
  title: "Universe | AI Chatbot",
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
          <AI>
            <Header />
            {children}
            <Analytics />
          </AI>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
