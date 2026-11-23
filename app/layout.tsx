import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "FolioNexa — Your identity. Your work. Your world.",
  description: "A considered portfolio studio for people who make things.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}