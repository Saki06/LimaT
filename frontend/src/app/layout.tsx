import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Newtoz | Shape Your Future — Learning Ecosystem",
  description:
    "Newtoz (newtoz.com) — Shape Your Future. Smart interactive learning ecosystem guided by Tozy, the friendly winged baby elephant student companion.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/tozy_icon.png", type: "image/png" },
      { url: "/images/tozy_icon.jpg" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/images/tozy_icon.png" }
    ]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/tozy_icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/tozy_icon.png" />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-[#fbfcfb] text-slate-900 font-sans selection:bg-[#0d5c4d] selection:text-white flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
