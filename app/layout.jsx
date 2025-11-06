import React from "react";
import {
  Comfortaa,
  Courgette,
  Dancing_Script,
  Inter,
  Noto_Sans,
  Montserrat,
} from "next/font/google";
import "@/assets/styles/globals.css";
import { ThemeProvider } from "next-themes";
import Footer from "@/assets/components/Footer";
import AuthProvider from "@/assets/components/authProvider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/assets/components/Navbar2";

const poppins = Montserrat({ subsets: ["latin"], weight: "400" });

export const dancing = Courgette({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "Ohi! | Pitch. Persuade. Procure",
  description: "Find home businesses near you or anywhere around South Africa.",
  keywords:
    "home businesses, home industry, home stores, home store near me, home business near me, home store near me",
};

const MainLayout = ({ children }) => {
  return (
    <AuthProvider>
      <html suppressHydrationWarning>
        <body suppressHydrationWarning className={poppins.className}>
          <ThemeProvider attribute="class">
            <Navbar/>
            <div suppressHydrationWarning>{children}</div>
            <Footer />
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
};

export default MainLayout;
