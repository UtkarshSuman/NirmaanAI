import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PAIMANA AI | MoSPI Integrated Infrastructure Project Monitoring",
  description:
    "AI-powered predictive project monitoring platform for Central Sector Infrastructure Projects costing ₹150 Cr and above. MoSPI Infrastructure and Project Monitoring Division (IPMD).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#060913] text-gray-100 min-h-screen antialiased flex">
        {/* Fixed Top National Tricolor Stripe */}
        <div className="gov-tricolor-stripe fixed top-0 left-0 right-0 z-50 pointer-events-none" />

        {/* Fixed Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 ml-64 flex flex-col min-h-screen bg-gradient-to-b from-[#060913] via-[#090e1a] to-[#060913]">
          <TopNav unacknowledgedAlertsCount={14} />
          <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
