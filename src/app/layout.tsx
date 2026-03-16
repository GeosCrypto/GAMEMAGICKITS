import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameMagicKits – Prediction Arcade",
  description: "A virtual prediction arcade — make predictions on games, esports, tech, and pop culture using virtual credits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
