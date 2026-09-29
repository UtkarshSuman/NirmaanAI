import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import GovHeader from "@/components/GovHeader";
import GovFooter from "@/components/GovFooter";
import ChatWidget from "@/components/ChatWidget";
import DeviceAlertModal from "@/components/DeviceAlertModal";
import NavigationProgress from "@/components/NavigationProgress";
import prisma from "@/lib/prisma";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NIRMAAN AI | Predictive Infrastructure Intelligence",
  description:
    "Predictive Infrastructure Monitoring and Alert System for India — portfolio risk analytics, geospatial intelligence, forecasting, and AI-assisted project analysis.",
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
  let totalProjectsCount: number | null = null;

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
        {/* Real-time Route Navigation Progress Bar */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>

        {/* Top Utility and Identity Header */}
        <GovHeader />

        {/* Primary Horizontal Navigation */}
        <TopNav
          unacknowledgedAlertsCount={unacknowledgedCount}
          totalProjectsCount={totalProjectsCount ?? undefined}
        />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 w-full bg-[#f8fafc]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            {children}
          </div>
        </main>

        {/* Floating Chatbot Widget in Bottom-Right Corner */}
        <ChatWidget />

        {/* Global Device Alert & Ingestion Modal */}
        <DeviceAlertModal />

        {/* Platform Footer */}
        <GovFooter />
      </body>
    </html>
  );
}
