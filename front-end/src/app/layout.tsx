import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const metadata: Metadata = {
  title: "StudyMate",
  description: "Your personal learning management ai assistance platform",
  icons: {
    icon: [
      { 
        url: "/StudyMateLogo.png", 
        sizes: "50x50",
        type: "image/png" 
      },
    ],
    apple: { 
      url: "/StudyMateLogo.png", 
      sizes: "50x50",
      type: "image/png" 
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextThemesProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </NextThemesProvider>
      </body>
    </html>
  );
}