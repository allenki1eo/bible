import { NextRequest, NextResponse } from "next/server";

interface Verse {
  text: string;
  ref: string;
  textSw: string;
  refSw: string;
}

// 30 verses - one per day, rotates monthly
const VERSES: Verse[] = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11", textSw: "Kwa maana najua mawazo ninayowawazia, asema BWANA, ndiyo mawazo ya amani wala si ya mabaya, kuwapa tumaini siku zenu zijazo.", refSw: "Yeremia 29:11" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5", textSw: "Mtegemee BWANA kwa moyo wako wote, wala usitegemee ufahamu wako mwenyewe.", refSw: "Mithali 3:5" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13", textSw: "Yote ninaweza kwa Kristo anitiaye nguvu.", refSw: "Wafilipi 4:13" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9", textSw: "Kuwa na nguvu uwe na ujasiri; usiogope, wala usiwe na hofu; kwa maana BWANA, Mungu wako, yu pamoja nawe popote utakapokwenda.", refSw: "Yoshua 1:9" },
  { text: "The Lord is my shepherd, I lack nothing.", ref: "Psalm 23:1", textSw: "BWANA ndiye mchungaji wangu, sitapungukiwa na kitu.", refSw: "Zaburi 23:1" },
  { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", ref: "John 3:16", textSw: "Kwa maana Mungu aliupenda ulimwengu hivi hata akamtoa Mwanawe wa pekee, ili kila ampendaye asipotee, bali awe na uzima wa milele.", refSw: "Yohana 3:16" },
  { text: "And we know that in all things God works for the good of those who love him.", ref: "Romans 8:28", textSw: "Tunajua ya kuwa mambo yote hushiriki kwa pamoja kuleta wema kwa wale wampendao Mungu.", refSw: "Waroma 8:28" },
  { text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", ref: "Psalm 34:18", textSw: "BWANA yu karibu na wale waliovunjika moyo, na kuokoa walio na roho ya unyonge.", refSw: "Zaburi 34:18" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31", textSw: "Bali wale wanaomtumaini BWANA hufuata nguvu mpya; hupaa juu mabawa kama tai.", refSw: "Isaya 40:31" },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28", textSw: "Njoni kwangu, nyote msumbukao na wenye kubebwa mizigo, nami nitawapumzisha.", refSw: "Mathayo 11:28" },
  { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7", textSw: "Mtwalie mashaka yenu yote; kwa kuwa yeye hutunza ninyi.", refSw: "1 Petro 5:7" },
  { text: "Do not be anxious about anything, but in every situation, by prayer, present your requests to God.", ref: "Philippians 4:6", textSw: "Msiwe na wasiwasi wa neno lolote; bali katika kila jambo kwa kusali na kuomba, arifu Mungu mahitaji yenu.", refSw: "Wafilipi 4:6" },
  { text: "The Lord your God is with you, the Mighty Warrior who saves.", ref: "Zephaniah 3:17", textSw: "BWANA Mungu wako yu katikati yako, nguvu wa kuokoa.", refSw: "Sefania 3:17" },
  { text: "Blessed is the one who perseveres under trial. That person will receive the crown of life.", ref: "James 1:12", textSw: "Heri mtu aonaye majaribu na kuvumilia; atapokea taji ya uzima.", refSw: "Yakobo 1:12" },
  { text: "I sought the Lord, and he answered me; he delivered me from all my fears.", ref: "Psalm 34:4", textSw: "Niliutafuta BWANA, akanijibu, akaniondoa katika hofu zangu zote.", refSw: "Zaburi 34:4" },
  { text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning.", ref: "Lamentations 3:22-23", textSw: "Fadhili za BWANA hazikwishi, huruma yake haina mwisho; mpya kila asubuhi.", refSw: "Maombolezo 3:22-23" },
  { text: "He gives strength to the weary and increases the power of the weak.", ref: "Isaiah 40:29", textSw: "Yeye humpa mwenye uchovu nguvu, na kumwongezea nguvu yeye asiyekuwa na nguvu.", refSw: "Isaya 40:29" },
  { text: "With God all things are possible.", ref: "Matthew 19:26", textSw: "Kwa Mungu mambo yote yawezekana.", refSw: "Mathayo 19:26" },
  { text: "Peace I leave with you; my peace I give you.", ref: "John 14:27", textSw: "Amani nawasalia, amani yangu nawapa.", refSw: "Yohana 14:27" },
  { text: "The Lord will fight for you; you need only to be still.", ref: "Exodus 14:14", textSw: "BWANA atapigana ninyi, nanyi mtakuwa kimya.", refSw: "Kutoka 14:14" },
  { text: "Give thanks to the Lord, for he is good; his love endures forever.", ref: "Psalm 107:1", textSw: "Mshukuruni BWANA kwa kuwa yu mwema; kwa maana fadhili yake ni ya milele.", refSw: "Zaburi 107:1" },
  { text: "Delight yourself in the Lord, and he will give you the desires of your heart.", ref: "Psalm 37:4", textSw: "Jifurahishe katika BWANA, naye atakupa maoyo ya moyo wako.", refSw: "Zaburi 37:4" },
  { text: "Fear not, for I am with you; be not dismayed, for I am your God.", ref: "Isaiah 41:10", textSw: "Usiogope, kwa maana mimi niko pamoja nawe; usiwe na hofu, kwa maana mimi ndimi Mungu wako.", refSw: "Isaya 41:10" },
  { text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", ref: "Galatians 6:9", textSw: "Tusichoke kutenda mema; kwa kuwa tutavuna wakati wake, tusipukate tamaa.", refSw: "Wagalatia 6:9" },
  { text: "For we walk by faith, not by sight.", ref: "2 Corinthians 5:7", textSw: "Kwa kuwa tunaenenda kwa imani, si kwa kuona.", refSw: "2 Wakorintho 5:7" },
  { text: "My grace is sufficient for you, for my power is made perfect in weakness.", ref: "2 Corinthians 12:9", textSw: "Neema yangu inakutosha; kwa kuwa nguvu yangu hutimilika katika udhaifu.", refSw: "2 Wakorintho 12:9" },
  { text: "The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness.", ref: "Galatians 5:22", textSw: "Tunda la Roho ni upendo, furaha, amani, uvumilivu, wema, utu, uaminifu.", refSw: "Wagalatia 5:22" },
  { text: "I have told you these things, so that in me you may have peace. Take heart! I have overcome the world.", ref: "John 16:33", textSw: "Nimekuambieni mambo haya, mpate kuwa na amani ndani yangu. Shikeni moyo, mimi nimeushinda ulimwengu.", refSw: "Yohana 16:33" },
  { text: "May the God of hope fill you with all joy and peace as you trust in him.", ref: "Romans 15:13", textSw: "Na Mungu wa tumaini awajaze furaha yote na amani katika kumwamini.", refSw: "Waroma 15:13" },
  { text: "Blessed are the peacemakers, for they will be called children of God.", ref: "Matthew 5:9", textSw: "Heri wapatanishi, kwa kuwa wao watuitwa wanawe Mungu.", refSw: "Mathayo 5:9" },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "en";

  // Day of year - same verse for 24 hours, resets at midnight
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const verse = VERSES[dayOfYear % VERSES.length];

  if (lang === "sw") {
    return NextResponse.json({ text: verse.textSw, ref: verse.refSw });
  }

  return NextResponse.json({ text: verse.text, ref: verse.ref });
}
