"use client";

import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Globe,
  Bell,
  SignOut,
  CaretRight,
  Shield,
  UserPlus,
  Sun,
  Moon,
  Swatches,
  BookmarkSimple,
  Clock,
  BookOpen,
  UsersThree,
  Sparkle,
  ChartBar,
} from "@phosphor-icons/react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ThemeSelector } from "@/components/theme-selector";
import { NotificationToggle } from "@/components/notification-toggle";
import { LanguageToggle } from "@/components/language-toggle";

interface NotifPrefs {
  time: string;
  topics: string[];
}

const NOTIF_TIMES = [
  { value: "05:00", label: "5:00 AM" },
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
];

const NOTIF_TOPICS = [
  { key: "devotions", label: "Daily Devotion", labelSw: "Ibada ya Kila Siku", icon: <BookOpen size={13} /> },
  { key: "community", label: "Community activity", labelSw: "Shughuli za Jamii", icon: <UsersThree size={13} /> },
  { key: "stories", label: "New story tips", labelSw: "Vidokezo vya Hadithi", icon: <Sparkle size={13} /> },
];

function loadPrefs(): Partial<NotifPrefs> {
  try {
    return JSON.parse(localStorage.getItem("nuru_notif_prefs") || "{}") as Partial<NotifPrefs>;
  } catch { return {}; }
}

export default function ProfilePage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const localePrefix = pathname.split("/")[1];
  const isSw = locale === "sw";

  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({ time: "07:00", topics: ["devotions"] });

  useEffect(() => {
    const saved = loadPrefs();
    setNotifPrefs({
      time: saved.time ?? "07:00",
      topics: saved.topics ?? ["devotions"],
    });
  }, []);

  const savePrefs = (updated: NotifPrefs) => {
    setNotifPrefs(updated);
    localStorage.setItem("nuru_notif_prefs", JSON.stringify(updated));
  };

  const toggleTopic = (key: string) => {
    const topics = notifPrefs.topics.includes(key)
      ? notifPrefs.topics.filter((t) => t !== key)
      : [...notifPrefs.topics, key];
    savePrefs({ ...notifPrefs, topics });
  };

  return (
    <PageWrapper title={t("profile.title")}>
      <div className="px-4 py-6 space-y-6 page-enter">
        {/* User Card */}
        <Card>
          <CardContent className="p-5">
            {user ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-lg">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{user.displayName}</h2>
                  {user.isGuest ? (
                    <Badge variant="outline" className="mt-1">
                      {t("profile.guest_mode")}
                    </Badge>
                  ) : (
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <UserPlus size={40} className="text-muted-foreground mx-auto" />
                <p className="text-muted-foreground text-sm">
                  {isSw ? "Ingia kuona wasifu wako" : "Sign in to see your profile"}
                </p>
                <Button onClick={() => router.push(`/${locale}/auth`)}>
                  {t("profile.sign_in")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest CTA */}
        {user?.isGuest && (
          <Card className="border-dashed">
            <CardContent className="p-5 flex items-center gap-4">
              <UserPlus size={20} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">{t("profile.create_account")}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {t("profile.guest_note")}
                </p>
              </div>
              <Button size="sm" onClick={() => router.push(`/${locale}/auth`)}>
                {t("profile.sign_up")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider px-1">
            {isSw ? "Mipangilio" : "Settings"}
          </h3>

          {/* Language */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Globe size={20} className="text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{t("profile.language")}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {locale === "en" ? "English" : "Kiswahili"}
                </p>
              </div>
              <LanguageToggle />
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {theme === "dark" ? <Moon size={20} className="text-foreground" /> : <Sun size={20} className="text-foreground" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{isSw ? "Mandhari" : "Theme"}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {theme === "dark" ? (isSw ? "Giza" : "Dark") : theme === "light" ? (isSw ? "Mwangaza" : "Light") : (isSw ? "Mfumo" : "System")}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant={theme === "light" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setTheme("light")}>
                  <Sun size={16} />
                </Button>
                <Button variant={theme === "dark" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setTheme("dark")}>
                  <Moon size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Content */}
          <Card className="card-lift cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push(`/${localePrefix}/saved`)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <BookmarkSimple size={20} className="text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{isSw ? "Vilivyohifadhiwa" : "Saved Content"}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {isSw ? "Hadithi, ibada, na maombi yako" : "Your stories, devotions, and prayers"}
                </p>
              </div>
              <CaretRight size={16} className="text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Swatches size={20} className="text-foreground" />
                <h3 className="font-medium text-sm">{isSw ? "Mandhari" : "Appearance"}</h3>
              </div>
              <ThemeSelector />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Bell size={20} className="text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("profile.notifications")}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {isSw ? "Arifa za push" : "Push notifications"}
                    </p>
                  </div>
                </div>
                <NotificationToggle />
              </div>

              {/* Delivery time */}
              <div className="pl-14 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-muted-foreground" />
                  <Label className="text-muted-foreground text-xs">
                    {isSw ? "Wakati wa taarifa" : "Notification time (EAT)"}
                  </Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {NOTIF_TIMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => savePrefs({ ...notifPrefs, time: t.value })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                        notifPrefs.time === t.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:bg-accent"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Topic toggles */}
                <div className="pt-1 space-y-2">
                  <Label className="text-muted-foreground text-xs">
                    {isSw ? "Aina za arifa" : "Notify me about"}
                  </Label>
                  {NOTIF_TOPICS.map((topic) => (
                    <div key={topic.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {topic.icon}
                        {isSw ? topic.labelSw : topic.label}
                      </div>
                      <Switch
                        checked={notifPrefs.topics.includes(topic.key)}
                        onCheckedChange={() => toggleTopic(topic.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="card-lift cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push(`/${localePrefix}/analytics`)}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <ChartBar size={20} className="text-foreground" weight="fill" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{isSw ? "Takwimu" : "Analytics"}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {isSw ? "Ona jinsi Nuru inavyokua" : "See how Nuru is growing"}
                </p>
              </div>
              <CaretRight size={16} className="text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Shield size={20} className="text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{isSw ? "Faragha" : "Privacy"}</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  {isSw ? "Maombi yako yamefichwa" : "Your prayers are encrypted"}
                </p>
              </div>
              <CaretRight size={16} className="text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Sign Out */}
        {user && !user.isGuest && (
          <Button
            onClick={async () => { await signOut(); router.push(`/${locale}`); }}
            variant="outline"
            className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/30"
          >
            <SignOut size={16} />
            {t("profile.sign_out")}
          </Button>
        )}

        <div className="text-center py-4">
          <p className="text-muted-foreground/40 text-xs">Nuru v1.0.0</p>
        </div>
      </div>
    </PageWrapper>
  );
}
