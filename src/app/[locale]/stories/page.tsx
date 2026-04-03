"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-client-i18n";
import { useAuthStore } from "@/stores/auth-store";
import { createBrowserClient } from "@/lib/supabase-browser";
import { DrawingCanvas } from "@/components/drawing-canvas";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Sparkle,
  Play,
  Pause,
  FloppyDisk,
  BookOpen,
  Palette,
  SpeakerHigh,
  Warning,
  PencilSimple,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3 | "generating" | "result";

const heroes = [
  { id: "david", nameEn: "David", nameSw: "Daudi", emoji: "\u{1F3B5}", desc: "The shepherd boy who became king" },
  { id: "esther", nameEn: "Esther", nameSw: "Esther", emoji: "\u{1F451}", desc: "The queen who saved her people" },
  { id: "daniel", nameEn: "Daniel", nameSw: "Danieli", emoji: "\u{1F981}", desc: "The prophet in the lion's den" },
  { id: "ruth", nameEn: "Ruth", nameSw: "Ruthu", emoji: "\u{1F33E}", desc: "The loyal daughter-in-law" },
  { id: "joseph", nameEn: "Joseph", nameSw: "Yusufu", emoji: "\u{1F308}", desc: "The dreamer with the colorful coat" },
  { id: "mary", nameEn: "Mary", nameSw: "Mariamu", emoji: "\u{1F54A}\uFE0F", desc: "The mother of Jesus" },
  { id: "moses", nameEn: "Moses", nameSw: "Musa", emoji: "\u{1F4A1}", desc: "The leader who parted the sea" },
  { id: "noah", nameEn: "Noah", nameSw: "Noa", emoji: "\u{1F3A8}", desc: "The builder of the great ark" },
  { id: "samson", nameEn: "Samson", nameSw: "Samsoni", emoji: "\u{1F4AA}", desc: "The strongest man who ever lived" },
  { id: "solomon", nameEn: "Solomon", nameSw: "Sulemani", emoji: "\u{1F4DA}", desc: "The wisest king of all" },
  { id: "paul", nameEn: "Paul", nameSw: "Paulo", emoji: "\u2694\uFE0F", desc: "The apostle who changed the world" },
  { id: "peter", nameEn: "Peter", nameSw: "Petro", emoji: "\u{1F30A}", desc: "The disciple who walked on water" },
  { id: "abraham", nameEn: "Abraham", nameSw: "Ibrahimu", emoji: "\u2B50", desc: "The father of many nations" },
  { id: "hannah", nameEn: "Hannah", nameSw: "Hanna", emoji: "\u{1F64F}", desc: "The praying mother" },
  { id: "custom", nameEn: "Other Character", nameSw: "Mhusika Mwingine", emoji: "\u2728", desc: "Type any Bible character" },
];

const lessons = [
  { id: "sharing", emoji: "\u{1F91D}" },
  { id: "bravery", emoji: "\u{1F4AA}" },
  { id: "kindness", emoji: "\u{1F49D}" },
  { id: "forgiveness", emoji: "\u{1F49B}" },
  { id: "honesty", emoji: "\u2728" },
  { id: "faith", emoji: "\u{1F64F}" },
  { id: "obedience", emoji: "\u{1F44B}" },
  { id: "patience", emoji: "\u23F3" },
];

interface StoryResult {
  title: string;
  content: string;
  image: string | null;
  scriptureRefs: string;
  sceneDescription: string;
}

export default function StoriesPage() {
  const { t, locale } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
  const [customHeroName, setCustomHeroName] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [storyLength, setStoryLength] = useState<"short" | "medium">("short");
  const [storyLang, setStoryLang] = useState<"en" | "sw">(locale as "en" | "sw");
  const [customTitle, setCustomTitle] = useState("");
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [story, setStory] = useState<StoryResult | null>(null);
  const [genProgress, setGenProgress] = useState(0);
  const [genStatus, setGenStatus] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const [drawingOpen, setDrawingOpen] = useState(false);

  const isSw = locale === "sw";
  const heroData = heroes.find((h) => h.id === selectedHero);

  const getHeroDisplayName = () => {
    if (selectedHero === "custom") return customHeroName;
    return heroData ? (isSw ? heroData.nameSw : heroData.nameEn) : "";
  };

  const handleSaveToLibrary = async () => {
    if (!story || saved) return;
    setSaving(true);

    try {
      if (user && !user.isGuest) {
        const supabase = createBrowserClient();
        await supabase.from("stories").insert({
          user_id: user.id,
          hero: selectedHero || "",
          lesson: selectedLesson || "",
          language: storyLang,
          title: story.title,
          content: story.content,
          image_url: story.image,
        });
      }
      setSaved(true);
    } catch (err) {
      console.error("Save error:", err);
      // Still mark as saved locally
      setSaved(true);
    }
    setSaving(false);
  };

  const handleGenerate = async () => {
    setStep("generating");
    setGenProgress(10);
    setGenError(null);

    const heroName = getHeroDisplayName();

    try {
      // Step 1: Generate story text
      setGenStatus(isSw ? "AI inaandika hadithi..." : "AI is writing your story...");
      setGenProgress(20);

      const textRes = await fetch("/api/stories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero: heroName,
          lesson: selectedLesson,
          language: storyLang,
          length: storyLength,
          customTitle: customTitle.trim() || null,
        }),
      });

      if (!textRes.ok) {
        const err = await textRes.json();
        throw new Error(err.error || "Story generation failed");
      }

      const textData = await textRes.json();
      setGenProgress(50);

      // Step 2: Generate image using scene description from the story
      setGenStatus(isSw ? "Inapicha taswira ya hadithi..." : "Painting the story scene...");
      setGenProgress(60);

      let imageData = null;
      try {
        const imgRes = await fetch("/api/stories/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hero: heroName,
            lesson: selectedLesson,
            sceneDescription: textData.sceneDescription,
          }),
        });
        if (imgRes.ok) {
          imageData = await imgRes.json();
        } else {
          const errData = await imgRes.json();
          console.warn("Image generation failed:", errData.error);
        }
      } catch (imgErr) {
        console.warn("Image error:", imgErr);
      }
      setGenProgress(100);

      setStory({
        title: textData.title,
        content: textData.content,
        image: imageData?.image || null,
        scriptureRefs: textData.scriptureRefs || "",
        sceneDescription: textData.sceneDescription || "",
      });

      setStep("result");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setGenError(msg);
    }
  };

  // Generating screen
  if (step === "generating") {
    return (
      <PageWrapper>
        <div className="px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <Card className="w-full max-w-sm">
              <CardContent className="p-10 space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <BookOpen size={28} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {genError ? (isSw ? "Hitilafu" : "Error") : t("stories.generating")}
                  </h2>
                  {!genError && (
                    <p className="text-muted-foreground text-sm mt-1">{genStatus}</p>
                  )}
                </div>

                {genError ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                      <Warning size={16} weight="bold" />
                      <span>{genError}</span>
                    </div>
                    <Button onClick={() => setStep(3)} variant="outline" className="w-full">
                      {isSw ? "Jaribu Tena" : "Try Again"}
                    </Button>
                  </div>
                ) : (
                  <Progress value={genProgress} className="h-2" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Result screen
  if (step === "result" && story) {
    return (
      <PageWrapper>
        <div className="px-4 py-6 space-y-6 max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setStep(1); setStory(null); }}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveToLibrary}
                disabled={saving || saved}
                className="gap-1.5"
              >
                <FloppyDisk size={16} />
                {saving ? (isSw ? "Inahifadhi..." : "Saving...") : saved ? t("stories.saved") : t("stories.save_to_library")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setStep(1); setStory(null); }}>
                {t("stories.new_story")}
              </Button>
            </div>
          </div>

          {/* Story Image — full-bleed */}
          {story.image ? (
            <div className="-mx-4 -mt-6 overflow-hidden">
              <img src={story.image} alt={story.title} className="w-full aspect-[4/3] object-cover" />
            </div>
          ) : (
            <div className="-mx-4 -mt-6 overflow-hidden">
              <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="text-6xl">{heroData?.emoji || "\uD83D\uDCD6"}</div>
                  <p className="text-muted-foreground text-sm">
                    {isSw ? "Taswira haikupatikana" : "Image not available"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Story Title & Meta */}
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline">{getHeroDisplayName()}</Badge>
              <Badge variant="secondary">{t(`stories.lessons.${selectedLesson}`)}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{story.title}</h1>
            {story.scriptureRefs && (
              <p className="text-muted-foreground text-sm mt-2">
                {story.scriptureRefs}
              </p>
            )}
          </div>

          {/* Audio Player */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <button
              onClick={() => {
                if (playing) {
                  window.speechSynthesis.cancel();
                  setPlaying(false);
                } else {
                  const utterance = new SpeechSynthesisUtterance(story.content);
                  utterance.lang = storyLang === "sw" ? "sw-KE" : "en-US";
                  utterance.rate = 0.9;
                  utterance.pitch = 1;
                  utterance.onend = () => setPlaying(false);
                  window.speechSynthesis.speak(utterance);
                  setPlaying(true);
                }
              }}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors flex-shrink-0"
            >
              {playing
                ? <Pause size={18} className="text-primary" weight="fill" />
                : <Play size={18} className="text-primary ml-0.5" weight="fill" />}
            </button>
            <div className="flex-1">
              <p className="text-muted-foreground text-xs">
                {t("stories.play_audio")} &middot; {storyLang === "sw" ? "Kiswahili" : "English"}
              </p>
            </div>
            <SpeakerHigh size={16} className="text-muted-foreground" />
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
            <span className="text-muted-foreground/40 text-xs tracking-widest uppercase">The Story</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />
          </div>

          {/* Story Content — storybook style */}
          <div className="py-4">
            <div className="space-y-6">
              {story.content.split("\n\n").map((paragraph, i) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                // Drop cap on first paragraph
                if (i === 0) {
                  const firstChar = trimmed.charAt(0);
                  const rest = trimmed.slice(1);
                  return (
                    <p key={i} className="text-[17px] leading-[1.85] text-foreground/90">
                      <span className="float-left text-5xl font-bold text-primary leading-[0.8] mr-2 mt-1 font-serif">
                        {firstChar}
                      </span>
                      {rest}
                    </p>
                  );
                }

                // Scripture callout — looks for "SCRIPTURE" or "MAANDIKO" sections
                if (trimmed.toUpperCase().includes("SCRIPTURE") || trimmed.toUpperCase().includes("MAANDIKO")) {
                  return (
                    <div key={i} className="my-6 p-5 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                          {isSw ? "Maandiko" : "Scripture References"}
                        </span>
                        <div className="flex-1 h-px bg-primary/20" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {trimmed}
                      </p>
                    </div>
                  );
                }

                return (
                  <p key={i} className="text-[17px] leading-[1.85] text-foreground/90">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </div>

          {/* End ornament */}
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-muted-foreground/20" />
              <span className="text-muted-foreground/30 text-lg">\u2726</span>
              <div className="w-8 h-px bg-muted-foreground/20" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" size="lg" onClick={() => setDrawingOpen(true)}>
              <Palette size={20} />
              {t("stories.draw_with_story")}
            </Button>
          </div>
        </div>

        {/* Drawing Canvas Overlay */}
        <DrawingCanvas
          isOpen={drawingOpen}
          onClose={() => setDrawingOpen(false)}
          backgroundImage={story?.image}
        />
      </PageWrapper>
    );
  }

  // Wizard
  return (
    <PageWrapper>
      <div className="px-4 py-6 space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold">{t("stories.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("stories.subtitle")}</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${typeof step === "number" && step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${typeof step === "number" && step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Hero */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("stories.step_hero")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {heroes.map((hero) => (
                <Card
                  key={hero.id}
                  className={`cursor-pointer transition-all hover:border-primary/30 ${selectedHero === hero.id ? "border-primary ring-2 ring-primary/20" : ""}`}
                  onClick={() => setSelectedHero(hero.id)}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <div className="text-3xl">{hero.emoji}</div>
                    <h3 className="font-semibold text-sm">{isSw ? hero.nameSw : hero.nameEn}</h3>
                    <p className="text-muted-foreground text-[11px] leading-tight">{hero.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom hero name input */}
            {selectedHero === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <PencilSimple size={16} />
                  {isSw ? "Andika jina la mhusika" : "Enter character name"}
                </label>
                <Input
                  value={customHeroName}
                  onChange={(e) => setCustomHeroName(e.target.value)}
                  placeholder={isSw ? "mf. Samweli, Gideon, Naomi..." : "e.g. Samuel, Gideon, Naomi..."}
                />
              </div>
            )}

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedHero || (selectedHero === "custom" && !customHeroName.trim())}
              className="w-full gap-2"
              size="lg"
            >
              {t("common.next")} <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Step 2: Lesson */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">{t("stories.step_lesson")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {lessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className={`cursor-pointer transition-all hover:border-primary/30 ${selectedLesson === lesson.id ? "border-primary ring-2 ring-primary/20" : ""}`}
                  onClick={() => setSelectedLesson(lesson.id)}
                >
                  <CardContent className="p-4 text-center space-y-2">
                    <span className="text-3xl">{lesson.emoji}</span>
                    <h3 className="font-medium text-sm">{t(`stories.lessons.${lesson.id}`, {}, ) || lesson.id.charAt(0).toUpperCase() + lesson.id.slice(1)}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">{t("common.back")}</Button>
              <Button onClick={() => setStep(3)} disabled={!selectedLesson} className="flex-1 gap-2">{t("common.next")} <ArrowRight size={16} /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">{t("stories.step_settings")}</h2>

            {/* Summary */}
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{heroData?.emoji || "\u2728"}</span>
                <div>
                  <p className="font-medium text-sm">{getHeroDisplayName()}</p>
                  <p className="text-muted-foreground text-xs">
                    {selectedLesson && t(`stories.lessons.${selectedLesson}`)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div>
              <p className="text-muted-foreground text-sm mb-3">{t("stories.length")}</p>
              <div className="grid grid-cols-2 gap-3">
                {(["short", "medium"] as const).map((len) => (
                  <Card key={len} className={`cursor-pointer transition-all hover:border-primary/30 ${storyLength === len ? "border-primary ring-2 ring-primary/20" : ""}`} onClick={() => setStoryLength(len)}>
                    <CardContent className="p-4 text-center">
                      <BookOpen size={24} className={`mx-auto mb-2 ${storyLength === len ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-sm font-medium">{t(`stories.${len}`)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm mb-3">{t("stories.language")}</p>
              <div className="grid grid-cols-2 gap-3">
                {(["en", "sw"] as const).map((lang) => (
                  <Card key={lang} className={`cursor-pointer transition-all hover:border-primary/30 ${storyLang === lang ? "border-primary ring-2 ring-primary/20" : ""}`} onClick={() => setStoryLang(lang)}>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm font-medium">{lang === "en" ? t("stories.english") : t("stories.swahili")}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Story Title */}
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">{t("stories.custom_title") || (isSw ? "Kichwa cha Hadithi (Hiari)" : "Story Title (Optional)")}</p>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={isSw ? "mf. Daudi na Simba, Noa na Mafuriko..." : "e.g. David and the Lion, Noah and the Flood..."}
                maxLength={80}
              />
              <p className="text-muted-foreground text-xs">
                {isSw ? "Andika kichwa unachotaka au acha tupu kwa AI kuandika" : "Write your own title or leave blank for AI to decide"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1">{t("common.back")}</Button>
              <Button onClick={handleGenerate} className="flex-1 gap-2" size="lg">
                <Sparkle size={18} weight="bold" />
                {t("stories.generate")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
