import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // opcional
});

export const metadata: Metadata = {
  title: "GovAtende",
  description: "Lado a lado com o cidadão",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased bg-gray-100`}>
        {children}
      </body>
    </html>
  );
}
