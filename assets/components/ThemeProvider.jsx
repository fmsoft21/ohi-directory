"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({className: props}) {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Button
      suppressHydrationWarning
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={props}
    >
      {theme === "dark" ? (
        <Sun
          suppressHydrationWarning
          className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:text-white"
          data-oid=":_b94hm"
        />
      ) : (
        <Moon
          suppressHydrationWarning
          className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 text-zinc-700 transition-all"
          data-oid="lncmky-"
        />
      )}
      <span className="sr-only" data-oid="a5cyjhg">
        Toggle theme
      </span>
    </Button>
  );
}
