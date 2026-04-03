import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React, { Suspense } from 'react';
import { RoleProvider } from "@/context/RoleContext";
import Sidebar from "@/components/Sidebar";
import AIChatbot from "@/components/AIChatbot";
import Login3DBackground from "@/components/Login3DBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UniPortal 4.0",
  description: "Next-Gen Smart Campus Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RoleProvider>
          <div className="relative min-h-screen bg-[#020617]">
            <div className="relative z-10 flex">
              <Suspense fallback={<div className="w-[var(--sidebar-width)] bg-[#06061a]" />}>
                <Sidebar />
              </Suspense>
              <main className="flex-1 min-w-0 relative">
                {children}
                <AIChatbot />
              </main>
            </div>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
