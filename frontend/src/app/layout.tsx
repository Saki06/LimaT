import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Newtoz | Shape Your Future — Learning Ecosystem",
  description:
    "Newtoz (newtoz.com) — Shape Your Future. Smart interactive learning ecosystem guided by Tozy, the friendly winged baby elephant student companion.",
  icons: {
    icon: "/images/tozy_icon.jpg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-[#fbfcfb] text-slate-900 font-sans selection:bg-[#0d5c4d] selection:text-white flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
