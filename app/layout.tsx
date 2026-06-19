import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "דו\"חירבון",
  description: "כי כל חוויה ראויה לתיעוד."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
