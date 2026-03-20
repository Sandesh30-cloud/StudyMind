import type { Metadata } from "next";
import { Lora, DM_Sans } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudyMind — AI Study Assistant",
  description:
    "Your personal AI-powered study companion. Understand concepts, solve problems step-by-step, and master any subject.",
  keywords: ["study assistant", "AI tutor", "learning", "education", "Gemini AI"],
  openGraph: {
    title: "StudyMind — AI Study Assistant",
    description: "Learn smarter with your personal AI tutor",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
