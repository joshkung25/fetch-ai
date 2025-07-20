// "use client";
// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/navbar";
import { ThemeProvider } from "next-themes";
// import { useState } from "react";
// import Sidebar from "./sidebar";
import ChatSidebar from "./chat-sidebar";
import { Metadata } from "next";

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
    icon: "/fetchicon.ico",
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
          {/* <Navbar collapsed={collapsed} setCollapsed={setCollapsed} /> */}
          <div className="flex flex-row h-screen w-full">
            {/* <Sidebar collapsed={collapsed} /> */}
            <ChatSidebar />
            {/*  */}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
