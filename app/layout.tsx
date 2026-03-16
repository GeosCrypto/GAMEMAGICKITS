import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "GameMagicKit – Prediction Arcade",
  description:
    "Predict outcomes in gaming, esports, tech, and pop culture. Earn XP, climb the leaderboard, and dominate the prediction arcade. No real money – pure skill.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white min-h-screen font-sans">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
