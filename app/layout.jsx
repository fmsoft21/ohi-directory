// app/layout.jsx - Updated
import React from "react";
import {
  Inter,
  Manrope,
  Zalando_Sans_SemiExpanded,
  Raleway
} from "next/font/google";
import "@/assets/styles/globals.css";
import { ThemeProvider } from "next-themes";
import Footer from "@/assets/components/Footer";
import AuthProvider from "@/assets/components/authProvider";
import { CartProvider } from "@/assets/contexts/CartContext";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/assets/components/Navbar2";
import DisableZoom from "@/app/DisableZoom";
import Head from "next/head";
import { Metadata } from "next"


const font = Zalando_Sans_SemiExpanded({ subsets: ["latin"], weight: "400" });


export const metadata: Metadata = {
  title: "Ohi! | Pitch. Persuade. Procure",
  description: "Find home businesses near you or anywhere around South Africa.",
  keywords:
    "home businesses, home industry, home stores, home store near me, home business near me, home store near me",
  manifest: '/manifest.json',
  themeColor: '#059669',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ohi!',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

const MainLayout = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <meta 
            name="viewport" 
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="theme-color" content="#059669" />
          
        </Head>
        <html suppressHydrationWarning>
          <body suppressHydrationWarning className={font.className}>
            <ThemeProvider attribute="class">
              <DisableZoom />
              <Navbar/>
              <div suppressHydrationWarning>{children}</div>
              <Footer />
            </ThemeProvider>
            <Toaster />
          </body>
        </html>
      </CartProvider>
    </AuthProvider>
  );
};

export default MainLayout;