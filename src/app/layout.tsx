import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavBar from "./ui/NavBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Ruokatutka",
  // Add a description
  description: "asdasdasd",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
      >
        <NavBar />

        <main className="flex justify-center items-center mx-auto min-h-screen justify-around">
          {children}
        </main>
      </body>
    </html>
  );
}