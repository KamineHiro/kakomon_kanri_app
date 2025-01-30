"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <span className="text-lg">
        {theme === "light" ? "🌙" : "☀️"}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}