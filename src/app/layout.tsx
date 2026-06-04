import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "随手做 CookSnap",
  description: "用手边食材快速找到今天能做的菜。",
  manifest: "/manifest.webmanifest"
};

export const viewport: Viewport = {
  themeColor: "#2f6f4e",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
