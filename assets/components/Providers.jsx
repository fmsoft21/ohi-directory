// assets/components/Providers.jsx
"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/assets/contexts/CartContext";
import { MessagesProvider } from "@/assets/contexts/MessagesContext";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class">
        <CartProvider>
          <MessagesProvider>
            {children}
          </MessagesProvider>
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}