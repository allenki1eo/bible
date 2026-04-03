"use client";

import { create } from "zustand";

export interface ThemeBackground {
  id: string;
  name: string;
  src: string;
  thumb: string;
}

export const THEME_BACKGROUNDS: ThemeBackground[] = [
  { id: "none", name: "None", src: "", thumb: "" },
  { id: "sunset1", name: "Sunset 1", src: "/backgrounds/sunset1.jpeg", thumb: "/backgrounds/sunset1.jpeg" },
  { id: "sunset2", name: "Sunset 2", src: "/backgrounds/sunset2.webp", thumb: "/backgrounds/sunset2.webp" },
  { id: "sunset3", name: "Sunset 3", src: "/backgrounds/sunset3.jpeg", thumb: "/backgrounds/sunset3.jpeg" },
  { id: "sunset4", name: "Sunset 4", src: "/backgrounds/sunset4.webp", thumb: "/backgrounds/sunset4.webp" },
];

interface ThemeState {
  background: string;
  liquidGlass: boolean;
  setBackground: (id: string) => void;
  setLiquidGlass: (on: boolean) => void;
  loadTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  background: "none",
  liquidGlass: false,

  setBackground: (id: string) => {
    set({ background: id });
    if (typeof window !== "undefined") {
      localStorage.setItem("faithflow_bg", id);
    }
  },

  setLiquidGlass: (on: boolean) => {
    set({ liquidGlass: on });
    if (typeof window !== "undefined") {
      localStorage.setItem("faithflow_glass", on ? "1" : "0");
    }
  },

  loadTheme: () => {
    if (typeof window === "undefined") return;
    const bg = localStorage.getItem("faithflow_bg");
    const glass = localStorage.getItem("faithflow_glass");
    if (bg) set({ background: bg });
    if (glass === "1") set({ liquidGlass: true });
  },
}));
