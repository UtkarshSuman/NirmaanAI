import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import GovHeader from "@/components/GovHeader";
import GovFooter from "@/components/GovFooter";
import prisma from "@/lib/prisma";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PAIMANA AI | MoSPI Integrated Infrastructure Project Monitoring",
  description:
    "AI-powered predictive project monitoring platform for Central Sector Infrastructure Projects costing ₹150 Cr and above. MoSPI Infrastructure and Project Monitoring Division (IPMD).",
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
      <body className="bg-[#050813] text-gray-100 min-h-screen antialiased flex flex-col selection:bg-sky-500/30 selection:text-white">
        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 ml-64 flex flex-col min-h-screen bg-gradient-to-b from-[#060913] via-[#080d1a] to-[#050813]">
          {/* Government of India Official Topmost Banner */}
          <GovHeader />

          {/* Operational Top Navigation Bar with Real-Time Database Counts */}
          <TopNav
            unacknowledgedAlertsCount={unacknowledgedCount}
            totalProjectsCount={totalProjectsCount}
          />

          {/* Main Content */}
          <main id="main-content" className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>

          {/* Government of India Official Footer */}
          <GovFooter />
        </div>
      </body>
    </html>
  );
}
