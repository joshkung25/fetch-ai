// "use client";
// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
// import { useState } from "react";
// import Sidebar from "./sidebar";
import ChatSidebar from "./chat-sidebar";
import { Metadata } from "next";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ContextProvider } from "@/context";
import { DocumentsProvider } from "@/context/DocumentsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fetch AI",
  description: "Fetch AI",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ContextProvider>
            <SidebarProvider>
              <DocumentsProvider>
                <ChatSidebar />
                {children}
              </DocumentsProvider>
            </SidebarProvider>
          </ContextProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
