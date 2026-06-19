import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dochirbun.vercel.app"),
  title: {
    default: "דו\"חירבון",
    template: "%s | דו\"חירבון"
  },
  description: "כי כל חוויה ראויה לתיעוד.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "דו\"חירבון",
    description: "מערכת הומוריסטית לתיעוד חירבונים בלבד.",
    url: "/",
    siteName: "דו\"חירבון",
    locale: "he_IL",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "דו\"חירבון - כי כל חוויה ראויה לתיעוד."
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "דו\"חירבון",
    description: "כי כל חוויה ראויה לתיעוד.",
    images: ["/opengraph-image"]
  }
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
