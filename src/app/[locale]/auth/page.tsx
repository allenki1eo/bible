"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Envelope, Lock, User, Eye, EyeSlash, Sparkle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInAsGuest = useAuthStore((s) => s.signInAsGuest);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSw = locale === "sw";

  const handleSignIn = async () => {
    setError("");
    if (!email) return setError(t("auth.invalid_email"));
    if (password.length < 6) return setError(t("auth.password_short"));
    setLoading(true);
    try {
      await signIn(email, password);
      router.push(`/${locale}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.error"));
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setError("");
    if (!displayName) return setError(isSw ? "Andika jina lako" : "Enter your name");
    if (!email) return setError(t("auth.invalid_email"));
    if (password.length < 6) return setError(t("auth.password_short"));
    if (password !== confirmPassword) return setError(t("auth.passwords_mismatch"));
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      router.push(`/${locale}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("auth.error"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back button */}
      <div className="p-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* ── Hero / Branding ── */}
      <div className="flex flex-col items-center px-6 pt-2 pb-8 text-center">
        <div className="relative mb-4">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl scale-110" />
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-primary/20">
            <img
              src="/logos/light.png"
              alt="Nuru"
              className="w-full h-full object-cover dark:hidden"
            />
            <img
              src="/logos/dark.png"
              alt="Nuru"
              className="w-full h-full object-cover hidden dark:block"
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{t("app.name")}</h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs">{t("app.tagline")}</p>

        {/* Decorative sparkles */}
        <div className="flex items-center gap-1.5 mt-3">
          {["Faith", "Hope", "Love"].map((w) => (
            <span
              key={w}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/8 text-primary text-[11px] font-medium"
            >
              <Sparkle size={9} weight="fill" />
              {isSw ? (w === "Faith" ? "Imani" : w === "Hope" ? "Tumaini" : "Upendo") : w}
            </span>
          ))}
        </div>
      </div>

      {/* ── Forms ── */}
      <div className="flex-1 px-4 pb-10 max-w-md mx-auto w-full">
        <Tabs defaultValue="signin">
          <TabsList className="w-full grid grid-cols-2 mb-5 rounded-xl h-11">
            <TabsTrigger value="signin" className="rounded-lg text-sm font-medium">
              {t("auth.sign_in")}
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg text-sm font-medium">
              {t("auth.sign_up")}
            </TabsTrigger>
          </TabsList>

          {/* Sign In */}
          <TabsContent value="signin">
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("auth.email")}
                  </Label>
                  <div className="relative">
                    <Envelope size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                      placeholder="you@example.com"
                      className="pl-9 h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-11 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-destructive text-xs bg-destructive/8 px-3 py-2 rounded-lg">{error}</p>
                )}
                <Button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full h-11 rounded-xl font-semibold"
                  size="lg"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    : t("auth.sign_in")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign Up */}
          <TabsContent value="signup">
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isSw ? "Jina" : "Display Name"}
                  </Label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={isSw ? "Jina lako" : "Your name"}
                      className="pl-9 h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("auth.email")}
                  </Label>
                  <div className="relative">
                    <Envelope size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-9 h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("profile.confirm_password")}
                  </Label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                      placeholder="••••••••"
                      className="pl-9 h-11 rounded-xl"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-destructive text-xs bg-destructive/8 px-3 py-2 rounded-lg">{error}</p>
                )}
                <Button
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full h-11 rounded-xl font-semibold"
                  size="lg"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    : t("auth.create_account")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-xs font-medium">{t("profile.or")}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* OAuth + Guest */}
        <div className="space-y-2.5">
          <Button
            onClick={signInWithGoogle}
            variant="outline"
            className="w-full gap-2.5 h-11 rounded-xl font-medium border-border/80"
            size="lg"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t("auth.continue_google")}
          </Button>
          <Button
            onClick={() => { signInAsGuest(); router.push(`/${locale}`); }}
            variant="ghost"
            className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground font-medium"
          >
            {t("auth.continue_guest")}
          </Button>
        </div>

        <p className="text-center text-muted-foreground/60 text-[11px] mt-6">
          {isSw ? "Salama · Binafsi · Imani" : "Secure · Private · Faith-based"}
        </p>
      </div>
    </div>
  );
}
