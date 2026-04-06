import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nuru — Grow in faith, together",
  description:
    "Daily devotionals, AI-powered Bible stories for kids, community testimonies, and prayer journaling — all in one faith app for East Africa.",
};

const FEATURES = [
  {
    icon: "📖",
    title: "Daily Devotionals",
    titleSw: "Ibada za Kila Siku",
    desc: "Start every morning with scripture-grounded reflections, prayer prompts, and a verse tailored to your walk with God.",
    color: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    icon: "✨",
    title: "AI Bible Stories",
    titleSw: "Hadithi za Biblia",
    desc: "Beautiful bedtime stories for children drawn straight from scripture — generated in English or Swahili with vivid illustrations.",
    color: "from-purple-500/10 to-purple-500/5",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  },
  {
    icon: "🙌",
    title: "Community Wall",
    titleSw: "Ukuta wa Jamii",
    desc: "Share what God is doing in your life. Read testimonies from fellow believers and be encouraged together.",
    color: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  {
    icon: "🔥",
    title: "Streak & Growth",
    titleSw: "Ukuaji wa Kiroho",
    desc: "Track your daily consistency with streaks, prayer journals, and a personal record of your spiritual journey.",
    color: "from-orange-500/10 to-orange-500/5",
    border: "border-orange-500/20",
    iconBg: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  {
    icon: "🎨",
    title: "Kids Drawing Canvas",
    titleSw: "Mchoraji wa Watoto",
    desc: "An interactive drawing canvas where children can creatively engage with Bible stories using colourful stamps and brushes.",
    color: "from-pink-500/10 to-pink-500/5",
    border: "border-pink-500/20",
    iconBg: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  },
  {
    icon: "🌍",
    title: "English & Swahili",
    titleSw: "Kiingereza & Kiswahili",
    desc: "Fully localised for East Africa — switch between English and Swahili at any time. Devotionals and stories generated natively.",
    color: "from-teal-500/10 to-teal-500/5",
    border: "border-teal-500/20",
    iconBg: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    desc: "Sign up with Google or continue as a guest — no credit card, no friction.",
  },
  {
    n: "02",
    title: "Choose your language",
    desc: "Pick English or Kiswahili. Every devotional and story is generated in the language you love.",
  },
  {
    n: "03",
    title: "Open today's devotion",
    desc: "A fresh scripture-based reflection waits for you every morning. Read, pray, and journal.",
  },
  {
    n: "04",
    title: "Share with your community",
    desc: "Post a testimony, encourage someone, or let your story bless the whole body.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Nuru imebadilisha jinsi ninavyosoma Biblia kila siku. Hadithi za watoto wangu sasa zina msingi wa kweli.",
    author: "Amina K.",
    location: "Nairobi, Kenya",
  },
  {
    quote:
      "The devotionals are rooted in scripture and feel personal. My streak keeps me accountable every single morning.",
    author: "David M.",
    location: "Kampala, Uganda",
  },
  {
    quote:
      "I love that I can read testimonies from believers across East Africa. It reminds me we are not alone in our faith walk.",
    author: "Grace W.",
    location: "Dar es Salaam, Tanzania",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <img
              src="/logos/light.png"
              alt="Nuru"
              className="h-8 w-8 rounded-lg object-contain dark:hidden"
            />
            <img
              src="/logos/dark.png"
              alt="Nuru"
              className="hidden h-8 w-8 rounded-lg object-contain dark:block"
            />
            <span className="text-lg font-bold tracking-tight">Nuru</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">
              Testimonials
            </a>
          </nav>
          <Link
            href="/en"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            Open App
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pt-28">
        {/* background blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-2xl"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Now available in English &amp; Kiswahili
          </div>

          {/* headline */}
          <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Grow in faith,{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)), hsl(142 60% 48%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              together.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Daily devotionals rooted in scripture, AI-powered Bible stories for
            your children, and a community of believers across East Africa — all
            in one beautiful PWA.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/en"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity sm:w-auto"
            >
              Start for free
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href="/sw"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-8 py-3.5 text-base font-semibold hover:bg-muted transition-colors sm:w-auto"
            >
              🇹🇿 Anza kwa Kiswahili
            </Link>
          </div>

          {/* trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="text-primary">✓</span> Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-primary">✓</span> Works offline (PWA)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-primary">✓</span> No ads, ever
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-primary">✓</span> Biblically grounded
            </span>
          </div>
        </div>

        {/* hero mockup card */}
        <div className="relative mx-auto mt-16 max-w-sm">
          <div className="rounded-3xl border border-border/60 bg-card shadow-2xl shadow-black/10 overflow-hidden">
            {/* phone notch bar */}
            <div className="flex items-center justify-between bg-muted/50 px-5 py-3 text-xs text-muted-foreground border-b border-border/40">
              <span className="font-semibold text-foreground">Nuru</span>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="h-2 w-2 rounded-full bg-green-400" />
              </div>
            </div>
            {/* mock devotion card */}
            <div className="p-5">
              <div className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Good morning ☀️
              </div>
              <div className="mb-4 text-lg font-bold">
                Today&apos;s Devotion
              </div>
              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(142 45% 32% / 0.1), hsl(142 45% 32% / 0.05))",
                  border: "1px solid hsl(142 45% 32% / 0.2)",
                }}
              >
                <p className="text-sm italic text-foreground/80 leading-relaxed">
                  &ldquo;The Lord is my shepherd; I shall not want.&rdquo;
                </p>
                <p className="mt-1 text-xs font-medium text-primary">
                  Psalm 23:1
                </p>
              </div>
              {/* mock stats row */}
              <div className="flex gap-2">
                <div className="flex-1 rounded-xl bg-orange-500/10 p-2.5 text-center">
                  <div className="text-xl font-bold text-orange-600">7</div>
                  <div className="text-[10px] text-orange-700/70 font-medium">day streak</div>
                </div>
                <div className="flex-1 rounded-xl bg-purple-500/10 p-2.5 text-center">
                  <div className="text-xl font-bold text-purple-600">12</div>
                  <div className="text-[10px] text-purple-700/70 font-medium">stories</div>
                </div>
                <div className="flex-1 rounded-xl bg-emerald-500/10 p-2.5 text-center">
                  <div className="text-xl font-bold text-emerald-600">4</div>
                  <div className="text-[10px] text-emerald-700/70 font-medium">testimonies</div>
                </div>
              </div>
            </div>
          </div>
          {/* floating notification */}
          <div className="absolute -right-4 -top-4 rounded-2xl border border-border bg-card px-3 py-2 shadow-lg text-xs flex items-center gap-2 max-w-[180px]">
            <span className="text-base">🔔</span>
            <div>
              <div className="font-semibold text-foreground">New testimony</div>
              <div className="text-muted-foreground">Grace shared a blessing</div>
            </div>
          </div>
          {/* floating story badge */}
          <div className="absolute -left-6 bottom-8 rounded-2xl border border-border bg-card px-3 py-2 shadow-lg text-xs flex items-center gap-2">
            <span className="text-base">✨</span>
            <div>
              <div className="font-semibold text-foreground">Story ready!</div>
              <div className="text-muted-foreground">David &amp; Goliath</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUPPORT BANNER ── */}
      <div className="border-y border-amber-500/20 bg-gradient-to-r from-amber-500/8 via-amber-400/5 to-amber-500/8 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="text-2xl shrink-0">🙏</span>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Nuru is free &amp; ad-free — help us keep it that way
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                If this app has blessed you, consider supporting our mission to reach more believers across East Africa.
              </p>
            </div>
          </div>
          <a
            href="https://snippe.me/pay/nuru"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
          >
            Support our mission ✦
          </a>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/8 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Features
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Everything you need for your faith journey
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Built for East African believers — practical, prayerful, and
              rooted in the Word.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`relative overflow-hidden rounded-2xl border ${f.border} bg-gradient-to-br ${f.color} p-6 transition-transform hover:-translate-y-0.5`}
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-xl ${f.iconBg}`}
                >
                  {f.icon}
                </div>
                <h3 className="mb-1 font-bold text-foreground">{f.title}</h3>
                <p className="text-xs font-medium text-muted-foreground mb-2 italic">
                  {f.titleSw}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VERSE BAND ── */}
      <section
        className="relative overflow-hidden px-4 py-16 sm:px-6"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(142 60% 38%) 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center text-white">
          <p className="mb-4 text-2xl font-bold leading-snug sm:text-3xl font-serif">
            &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
          </p>
          <p className="text-white/70 font-medium">Psalm 119:105</p>
          <p className="mt-2 text-sm text-white/60 italic">
            Neno lako ni taa ya miguu yangu, na mwanga wa njia yangu.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/8 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              How it works
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                  style={{
                    background: "hsl(var(--primary) / 0.1)",
                    color: "hsl(var(--primary))",
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="testimonials"
        className="px-4 py-20 sm:px-6 bg-muted/30"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <div className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/8 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Believers across East Africa
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {t.author}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-xl">
          <div className="mb-4 flex justify-center">
            <img
              src="/logos/light.png"
              alt="Nuru"
              className="h-16 w-16 rounded-2xl shadow-xl shadow-primary/20 dark:hidden"
            />
            <img
              src="/logos/dark.png"
              alt="Nuru"
              className="hidden h-16 w-16 rounded-2xl shadow-xl shadow-primary/20 dark:block"
            />
          </div>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Begin your journey today
          </h2>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            Join thousands of believers growing in faith every day. Free, no
            ads, works offline — the way it should be.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/en"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity sm:w-auto"
            >
              Open Nuru — English
            </Link>
            <Link
              href="/sw"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-8 py-3.5 text-base font-semibold hover:bg-muted transition-colors sm:w-auto"
            >
              Fungua Nuru — Kiswahili
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/logos/light.png"
                alt="Nuru"
                className="h-7 w-7 rounded-md object-contain dark:hidden"
              />
              <img
                src="/logos/dark.png"
                alt="Nuru"
                className="hidden h-7 w-7 rounded-md object-contain dark:block"
              />
              <span className="font-bold">Nuru</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/en/devotions" className="hover:text-foreground transition-colors">
                Devotions
              </Link>
              <Link href="/en/stories" className="hover:text-foreground transition-colors">
                Stories
              </Link>
              <Link href="/en/community" className="hover:text-foreground transition-colors">
                Community
              </Link>
              <Link href="/en/auth" className="hover:text-foreground transition-colors">
                Sign in
              </Link>
              <a
                href="https://snippe.me/pay/nuru"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors text-amber-600 dark:text-amber-400 font-medium"
              >
                Support ✦
              </a>
            </div>

            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Built with ❤️ for East Africa
              <br />
              &copy; {new Date().getFullYear()} Nuru
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
