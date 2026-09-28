import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import GovHeader from "@/components/GovHeader";
import GovFooter from "@/components/GovFooter";
import prisma from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PAIMAANA | National Capital Execution Observatory (MoSPI)",
  description:
    "National Infrastructure Project Monitoring Platform for Central Sector Projects costing ₹150 Cr and above. Ministry of Statistics and Programme Implementation (MoSPI).",
  icons: {
    icon: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let unacknowledgedCount = 0;
  let totalProjectsCount = 1931;

  try {
    const [unack, total] = await Promise.all([
      prisma.alert.count({ where: { isAcknowledged: false } }),
      prisma.project.count(),
    ]);
    unacknowledgedCount = unack;
    totalProjectsCount = total;
  } catch (err) {
    console.error("Error querying layout counts:", err);
  }

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#f8fafc] text-slate-900 min-h-screen antialiased flex flex-col selection:bg-orange-500/20 selection:text-orange-950 font-sans">
        {/* Government of India Official Topmost Banner */}
        <GovHeader />

        {/* Primary Horizontal Observatory Navigation */}
        <TopNav
          unacknowledgedAlertsCount={unacknowledgedCount}
          totalProjectsCount={totalProjectsCount}
        />

        {/* Main Observatory Content */}
        <main id="main-content" className="flex-1 w-full bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

        {/* Official Footer */}
        <GovFooter />
      </body>
    </html>
  );
}
