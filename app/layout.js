import { Public_Sans, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata = {
  title: "Bantay Stock",
  description: "Inventory & DENR compliance for aggregates & hardware supply",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${spaceGrotesk.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
