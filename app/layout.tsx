import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GovAtende",
  description: "Lado a lado com o cidadão",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
