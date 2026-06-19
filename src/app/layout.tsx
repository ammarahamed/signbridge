import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ClientLayout } from "./client-layout";

// Reuses the existing mycocoon.life GA4 property; SignBridge appears under /signbridge paths.
const GA_ID = "G-B280ZFSBQ4";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const title = "SignBridge — Learn Sign Language for Free";
const description =
  "Free, open-source sign language learning platform with 3D hand demonstrations, webcam practice, text-to-sign translation and live conversation. Learn ASL, BSL, ISL and more.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mycocoon.life"),
  title,
  description,
  keywords: ["sign language", "ASL", "BSL", "ISL", "learn", "free", "open source", "accessibility", "deaf", "fingerspelling"],
  openGraph: {
    title,
    description,
    url: "https://mycocoon.life/signbridge",
    siteName: "SignBridge",
    type: "website",
    images: [
      { url: "https://mycocoon.life/signbridge/og.png", width: 1200, height: 630, alt: "SignBridge — learn sign language, free and open-source" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://mycocoon.life/signbridge/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-gray-900 dark:text-gray-100">
        <ClientLayout>{children}</ClientLayout>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
