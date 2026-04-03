import { redirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n";
import { getLocaleFromCookie } from "@/lib/i18n-request";

export default async function RootPage() {
  const locale = await getLocaleFromCookie();
  redirect(`/${locale}`);
}
