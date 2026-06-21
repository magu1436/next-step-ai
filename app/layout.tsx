import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ネクストステップAI",
  description: "就活課題整理エージェント",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}