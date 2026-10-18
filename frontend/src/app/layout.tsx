import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "LimaT Tutor & Sports SaaS — Empowering Independent Tutors & Sports Tournaments",
  description:
    "LimaT SaaS brings independent tutor course packages, syllabus builder, student subscriptions, bank slip approvals, and campus sports tournaments into one unified platform."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full bg-[#fbfcfb] text-slate-900 font-sans selection:bg-[#0d5c4d] selection:text-white flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
