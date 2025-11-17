// app/layout.jsx - Updated with MessagesProvider
import React from "react";
import {
  Inter,
  Manrope,
  Zalando_Sans_SemiExpanded,
  Raleway,
} from "next/font/google";
import "@/assets/styles/globals.css";
import Footer from "@/assets/components/Footer";
import Providers from "@/assets/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/assets/components/Navbar2";
import DisableZoom from "@/app/DisableZoom";
import MobileLayoutWrapper from "@/assets/components/MobileLayoutWrapper";

const font = Zalando_Sans_SemiExpanded({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-zalando" });

export const metadata = {
  title: "Ohi! | Pitch. Persuade. Procure",
  description: "Find home businesses near you or anywhere around South Africa.",
  keywords:
    "home businesses, home industry, home stores, home store near me, home business near me, home store near me",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ohi!",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#059669",
};

const MainLayout = ({ children }) => {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning className={font.className}>
        <Providers>
          <DisableZoom />
          <Navbar />
          <MobileLayoutWrapper>
            <div suppressHydrationWarning>{children}</div>
          </MobileLayoutWrapper>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
};

export default MainLayout;
