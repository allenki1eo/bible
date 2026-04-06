import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/lib/i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // Exclude root (/) and /landing from locale middleware so the landing page renders directly
  matcher: ["/((?!api|_next|_vercel|landing|admin|.*\\..*).+)"],
};
