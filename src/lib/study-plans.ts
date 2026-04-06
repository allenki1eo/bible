export type StudyPlanChapter = {
  day: number;
  book: string;
  chapter: number;
  title: string;
  memoryVerse: string;
  memoryRef: string;
};

export type StudyPlan = {
  id: string;
  title: string;
  titleSw: string;
  description: string;
  descriptionSw: string;
  totalDays: number;
  icon: string;
  chapters: StudyPlanChapter[];
};

// ── 30 Days with Jesus (Mark) ─────────────────────────────────────────────────
const MARK_PLAN: StudyPlanChapter[] = [
  { day: 1,  book: "Mark", chapter: 1,  title: "The Beginning of the Gospel",       memoryVerse: "The time has come. The kingdom of God has come near. Repent and believe the good news!", memoryRef: "Mark 1:15" },
  { day: 2,  book: "Mark", chapter: 2,  title: "Healing & Forgiveness",              memoryVerse: "It is not the healthy who need a doctor, but the sick.", memoryRef: "Mark 2:17" },
  { day: 3,  book: "Mark", chapter: 3,  title: "Choosing the Twelve",               memoryVerse: "Whoever does God's will is my brother and sister and mother.", memoryRef: "Mark 3:35" },
  { day: 4,  book: "Mark", chapter: 4,  title: "Parables of the Kingdom",           memoryVerse: "With the measure you use, it will be measured to you.", memoryRef: "Mark 4:24" },
  { day: 5,  book: "Mark", chapter: 5,  title: "Power Over Demons & Death",         memoryVerse: "Don't be afraid; just believe.", memoryRef: "Mark 5:36" },
  { day: 6,  book: "Mark", chapter: 6,  title: "Feeding Five Thousand",             memoryVerse: "Take courage! It is I. Don't be afraid.", memoryRef: "Mark 6:50" },
  { day: 7,  book: "Mark", chapter: 7,  title: "What Defiles a Person",             memoryVerse: "Nothing outside a person can defile them.", memoryRef: "Mark 7:15" },
  { day: 8,  book: "Mark", chapter: 8,  title: "The Blind Man & Peter's Confession", memoryVerse: "What good is it for someone to gain the whole world, yet forfeit their soul?", memoryRef: "Mark 8:36" },
  { day: 9,  book: "Mark", chapter: 9,  title: "The Transfiguration",               memoryVerse: "Everything is possible for one who believes.", memoryRef: "Mark 9:23" },
  { day: 10, book: "Mark", chapter: 10, title: "Riches & the Kingdom",              memoryVerse: "What God has joined together, let no one separate.", memoryRef: "Mark 10:9" },
  { day: 11, book: "Mark", chapter: 11, title: "The Triumphal Entry",               memoryVerse: "Have faith in God.", memoryRef: "Mark 11:22" },
  { day: 12, book: "Mark", chapter: 12, title: "The Greatest Commandment",          memoryVerse: "Love the Lord your God with all your heart and all your soul.", memoryRef: "Mark 12:30" },
  { day: 13, book: "Mark", chapter: 13, title: "Signs of the End Times",            memoryVerse: "Heaven and earth will pass away, but my words will never pass away.", memoryRef: "Mark 13:31" },
  { day: 14, book: "Mark", chapter: 14, title: "The Last Supper",                   memoryVerse: "Not what I will, but what you will.", memoryRef: "Mark 14:36" },
  { day: 15, book: "Mark", chapter: 15, title: "The Crucifixion",                   memoryVerse: "Surely this man was the Son of God!", memoryRef: "Mark 15:39" },
  { day: 16, book: "Mark", chapter: 16, title: "The Resurrection",                  memoryVerse: "He has risen! He is not here.", memoryRef: "Mark 16:6" },
  { day: 17, book: "John", chapter: 1,  title: "The Word Became Flesh",             memoryVerse: "The Word became flesh and made his dwelling among us.", memoryRef: "John 1:14" },
  { day: 18, book: "John", chapter: 3,  title: "Born Again",                        memoryVerse: "For God so loved the world that he gave his one and only Son.", memoryRef: "John 3:16" },
  { day: 19, book: "John", chapter: 4,  title: "The Woman at the Well",             memoryVerse: "God is spirit, and his worshipers must worship in Spirit and in truth.", memoryRef: "John 4:24" },
  { day: 20, book: "John", chapter: 6,  title: "Bread of Life",                     memoryVerse: "I am the bread of life. Whoever comes to me will never go hungry.", memoryRef: "John 6:35" },
  { day: 21, book: "John", chapter: 10, title: "The Good Shepherd",                 memoryVerse: "I have come that they may have life, and have it to the full.", memoryRef: "John 10:10" },
  { day: 22, book: "John", chapter: 11, title: "Lazarus Raised",                    memoryVerse: "I am the resurrection and the life.", memoryRef: "John 11:25" },
  { day: 23, book: "John", chapter: 14, title: "I Am the Way",                      memoryVerse: "I am the way and the truth and the life.", memoryRef: "John 14:6" },
  { day: 24, book: "John", chapter: 15, title: "The Vine and the Branches",         memoryVerse: "Remain in me, as I also remain in you.", memoryRef: "John 15:4" },
  { day: 25, book: "John", chapter: 17, title: "Jesus' High Priestly Prayer",       memoryVerse: "That they may be one as we are one.", memoryRef: "John 17:22" },
  { day: 26, book: "John", chapter: 19, title: "The Cross",                         memoryVerse: "It is finished.", memoryRef: "John 19:30" },
  { day: 27, book: "John", chapter: 20, title: "The Empty Tomb",                    memoryVerse: "Because you have seen me, you have believed; blessed are those who have not seen and yet have believed.", memoryRef: "John 20:29" },
  { day: 28, book: "John", chapter: 21, title: "Do You Love Me?",                   memoryVerse: "Feed my sheep.", memoryRef: "John 21:17" },
  { day: 29, book: "Romans", chapter: 8, title: "Life in the Spirit",               memoryVerse: "And we know that in all things God works for the good of those who love him.", memoryRef: "Romans 8:28" },
  { day: 30, book: "Revelation", chapter: 21, title: "A New Heaven and Earth",      memoryVerse: "He will wipe every tear from their eyes. There will be no more death.", memoryRef: "Revelation 21:4" },
];

// ── Psalms in 21 Days ─────────────────────────────────────────────────────────
const PSALMS_SELECTION = [1, 8, 16, 19, 22, 23, 24, 27, 34, 46, 51, 84, 90, 91, 100, 103, 119, 121, 127, 139, 150];
const PSALMS_PLAN: StudyPlanChapter[] = [
  { day: 1,  book: "Psalms", chapter: 1,   title: "The Way of the Righteous",       memoryVerse: "Blessed is the one who does not walk in the counsel of the wicked.", memoryRef: "Psalm 1:1" },
  { day: 2,  book: "Psalms", chapter: 8,   title: "The Majesty of God",             memoryVerse: "Lord, our Lord, how majestic is your name in all the earth!", memoryRef: "Psalm 8:1" },
  { day: 3,  book: "Psalms", chapter: 16,  title: "Security in God",                memoryVerse: "You make known to me the path of life; you will fill me with joy.", memoryRef: "Psalm 16:11" },
  { day: 4,  book: "Psalms", chapter: 19,  title: "The Heavens Declare",            memoryVerse: "The heavens declare the glory of God; the skies proclaim the work of his hands.", memoryRef: "Psalm 19:1" },
  { day: 5,  book: "Psalms", chapter: 22,  title: "My God, Why Have You Forsaken Me?", memoryVerse: "For he has not despised the suffering of the afflicted one.", memoryRef: "Psalm 22:24" },
  { day: 6,  book: "Psalms", chapter: 23,  title: "The Lord is My Shepherd",        memoryVerse: "The Lord is my shepherd, I lack nothing.", memoryRef: "Psalm 23:1" },
  { day: 7,  book: "Psalms", chapter: 24,  title: "The King of Glory",              memoryVerse: "Who is this King of glory? The Lord Almighty — he is the King of glory.", memoryRef: "Psalm 24:10" },
  { day: 8,  book: "Psalms", chapter: 27,  title: "The Lord is My Light",           memoryVerse: "The Lord is my light and my salvation — whom shall I fear?", memoryRef: "Psalm 27:1" },
  { day: 9,  book: "Psalms", chapter: 34,  title: "Taste and See",                  memoryVerse: "Taste and see that the Lord is good; blessed is the one who takes refuge in him.", memoryRef: "Psalm 34:8" },
  { day: 10, book: "Psalms", chapter: 46,  title: "God is Our Refuge",              memoryVerse: "God is our refuge and strength, an ever-present help in trouble.", memoryRef: "Psalm 46:1" },
  { day: 11, book: "Psalms", chapter: 51,  title: "A Psalm of Repentance",          memoryVerse: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", memoryRef: "Psalm 51:10" },
  { day: 12, book: "Psalms", chapter: 84,  title: "Better is One Day",              memoryVerse: "Better is one day in your courts than a thousand elsewhere.", memoryRef: "Psalm 84:10" },
  { day: 13, book: "Psalms", chapter: 90,  title: "Lord, You Have Been Our Dwelling", memoryVerse: "Teach us to number our days, that we may gain a heart of wisdom.", memoryRef: "Psalm 90:12" },
  { day: 14, book: "Psalms", chapter: 91,  title: "Shelter of the Almighty",        memoryVerse: "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty.", memoryRef: "Psalm 91:1" },
  { day: 15, book: "Psalms", chapter: 100, title: "A Psalm of Praise",              memoryVerse: "Enter his gates with thanksgiving and his courts with praise.", memoryRef: "Psalm 100:4" },
  { day: 16, book: "Psalms", chapter: 103, title: "Bless the Lord, O My Soul",      memoryVerse: "As far as the east is from the west, so far has he removed our transgressions from us.", memoryRef: "Psalm 103:12" },
  { day: 17, book: "Psalms", chapter: 119, title: "The Word of God",                memoryVerse: "Your word is a lamp for my feet, a light on my path.", memoryRef: "Psalm 119:105" },
  { day: 18, book: "Psalms", chapter: 121, title: "My Help Comes from the Lord",    memoryVerse: "My help comes from the Lord, the Maker of heaven and earth.", memoryRef: "Psalm 121:2" },
  { day: 19, book: "Psalms", chapter: 127, title: "Unless the Lord Builds",         memoryVerse: "Unless the Lord builds the house, the builders labor in vain.", memoryRef: "Psalm 127:1" },
  { day: 20, book: "Psalms", chapter: 139, title: "You Have Searched Me, Lord",     memoryVerse: "I praise you because I am fearfully and wonderfully made.", memoryRef: "Psalm 139:14" },
  { day: 21, book: "Psalms", chapter: 150, title: "Praise the Lord",                memoryVerse: "Let everything that has breath praise the Lord.", memoryRef: "Psalm 150:6" },
];

// ── Book of Acts (28 Days) ────────────────────────────────────────────────────
const ACTS_PLAN: StudyPlanChapter[] = [
  { day: 1,  book: "Acts", chapter: 1,  title: "The Ascension & Matthias",         memoryVerse: "You will receive power when the Holy Spirit comes on you.", memoryRef: "Acts 1:8" },
  { day: 2,  book: "Acts", chapter: 2,  title: "Pentecost",                        memoryVerse: "Repent and be baptized, every one of you, in the name of Jesus Christ.", memoryRef: "Acts 2:38" },
  { day: 3,  book: "Acts", chapter: 3,  title: "The Lame Man Healed",              memoryVerse: "Silver or gold I do not have, but what I do have I give you.", memoryRef: "Acts 3:6" },
  { day: 4,  book: "Acts", chapter: 4,  title: "Peter & John Before the Council",  memoryVerse: "Salvation is found in no one else, for there is no other name under heaven.", memoryRef: "Acts 4:12" },
  { day: 5,  book: "Acts", chapter: 5,  title: "Ananias, Sapphira & the Apostles", memoryVerse: "We must obey God rather than human beings!", memoryRef: "Acts 5:29" },
  { day: 6,  book: "Acts", chapter: 6,  title: "The Seven Deacons",               memoryVerse: "Stephen, a man full of God's grace and power.", memoryRef: "Acts 6:8" },
  { day: 7,  book: "Acts", chapter: 7,  title: "Stephen's Speech & Martyrdom",    memoryVerse: "Lord, do not hold this sin against them.", memoryRef: "Acts 7:60" },
  { day: 8,  book: "Acts", chapter: 8,  title: "Philip & the Ethiopian",          memoryVerse: "Philip began with that very passage of Scripture and told him the good news.", memoryRef: "Acts 8:35" },
  { day: 9,  book: "Acts", chapter: 9,  title: "Saul's Conversion",               memoryVerse: "Saul, Saul, why do you persecute me?", memoryRef: "Acts 9:4" },
  { day: 10, book: "Acts", chapter: 10, title: "Cornelius & Peter",               memoryVerse: "I now realize how true it is that God does not show favoritism.", memoryRef: "Acts 10:34" },
  { day: 11, book: "Acts", chapter: 11, title: "Peter's Report",                  memoryVerse: "God has granted repentance that leads to life even to Gentiles.", memoryRef: "Acts 11:18" },
  { day: 12, book: "Acts", chapter: 12, title: "Peter's Miraculous Escape",       memoryVerse: "The Lord has sent his angel and rescued me.", memoryRef: "Acts 12:11" },
  { day: 13, book: "Acts", chapter: 13, title: "First Missionary Journey Begins", memoryVerse: "Set apart for me Barnabas and Saul for the work to which I have called them.", memoryRef: "Acts 13:2" },
  { day: 14, book: "Acts", chapter: 14, title: "Lystra & Derbe",                  memoryVerse: "We must go through many hardships to enter the kingdom of God.", memoryRef: "Acts 14:22" },
  { day: 15, book: "Acts", chapter: 15, title: "Jerusalem Council",               memoryVerse: "We believe it is through the grace of our Lord Jesus that we are saved.", memoryRef: "Acts 15:11" },
  { day: 16, book: "Acts", chapter: 16, title: "Lydia & the Philippian Jailer",   memoryVerse: "Believe in the Lord Jesus, and you will be saved.", memoryRef: "Acts 16:31" },
  { day: 17, book: "Acts", chapter: 17, title: "Athens & Mars Hill",              memoryVerse: "For in him we live and move and have our being.", memoryRef: "Acts 17:28" },
  { day: 18, book: "Acts", chapter: 18, title: "Corinth & Priscilla",             memoryVerse: "Do not be afraid; keep on speaking, do not be silent.", memoryRef: "Acts 18:9" },
  { day: 19, book: "Acts", chapter: 19, title: "Ephesus & the Riot",              memoryVerse: "The word of the Lord spread widely and grew in power.", memoryRef: "Acts 19:20" },
  { day: 20, book: "Acts", chapter: 20, title: "Farewell to Ephesus",             memoryVerse: "It is more blessed to give than to receive.", memoryRef: "Acts 20:35" },
  { day: 21, book: "Acts", chapter: 21, title: "Paul Arrested in Jerusalem",      memoryVerse: "The will of the Lord be done.", memoryRef: "Acts 21:14" },
  { day: 22, book: "Acts", chapter: 22, title: "Paul's Defense",                  memoryVerse: "And now what are you waiting for? Get up, be baptized and wash your sins away.", memoryRef: "Acts 22:16" },
  { day: 23, book: "Acts", chapter: 23, title: "Before the Sanhedrin",            memoryVerse: "Take courage! As you have testified about me in Jerusalem, so you must also testify in Rome.", memoryRef: "Acts 23:11" },
  { day: 24, book: "Acts", chapter: 24, title: "Before Felix",                    memoryVerse: "I always strive to keep my conscience clear before God and man.", memoryRef: "Acts 24:16" },
  { day: 25, book: "Acts", chapter: 25, title: "Before Festus",                   memoryVerse: "I appeal to Caesar!", memoryRef: "Acts 25:11" },
  { day: 26, book: "Acts", chapter: 26, title: "Before Agrippa",                  memoryVerse: "I pray to God that not only you but all who are listening today may become what I am.", memoryRef: "Acts 26:29" },
  { day: 27, book: "Acts", chapter: 27, title: "The Storm at Sea",               memoryVerse: "Keep up your courage, for I have faith in God that it will happen just as he told me.", memoryRef: "Acts 27:25" },
  { day: 28, book: "Acts", chapter: 28, title: "Malta & Rome",                    memoryVerse: "They will listen!", memoryRef: "Acts 28:28" },
];

// ── New Testament Essentials (60 Days) ───────────────────────────────────────
const NT_ESSENTIALS: StudyPlanChapter[] = [
  // Matthew
  { day: 1,  book: "Matthew", chapter: 5,  title: "The Beatitudes",                memoryVerse: "Blessed are the pure in heart, for they will see God.", memoryRef: "Matthew 5:8" },
  { day: 2,  book: "Matthew", chapter: 6,  title: "The Lord's Prayer",             memoryVerse: "Your kingdom come, your will be done, on earth as it is in heaven.", memoryRef: "Matthew 6:10" },
  { day: 3,  book: "Matthew", chapter: 7,  title: "Ask, Seek, Knock",              memoryVerse: "Ask and it will be given to you; seek and you will find.", memoryRef: "Matthew 7:7" },
  { day: 4,  book: "Matthew", chapter: 11, title: "Rest for the Weary",            memoryVerse: "Come to me, all you who are weary and burdened, and I will give you rest.", memoryRef: "Matthew 11:28" },
  { day: 5,  book: "Matthew", chapter: 28, title: "The Great Commission",          memoryVerse: "Therefore go and make disciples of all nations.", memoryRef: "Matthew 28:19" },
  // Luke
  { day: 6,  book: "Luke", chapter: 1,    title: "The Birth Foretold",            memoryVerse: "For nothing will be impossible with God.", memoryRef: "Luke 1:37" },
  { day: 7,  book: "Luke", chapter: 2,    title: "The Birth of Jesus",            memoryVerse: "Glory to God in the highest heaven, and on earth peace to those on whom his favor rests.", memoryRef: "Luke 2:14" },
  { day: 8,  book: "Luke", chapter: 10,   title: "The Good Samaritan",            memoryVerse: "Love the Lord your God with all your heart and love your neighbor as yourself.", memoryRef: "Luke 10:27" },
  { day: 9,  book: "Luke", chapter: 15,   title: "The Prodigal Son",              memoryVerse: "While he was still a long way off, his father saw him and was filled with compassion.", memoryRef: "Luke 15:20" },
  { day: 10, book: "Luke", chapter: 24,   title: "He is Risen",                   memoryVerse: "Why do you look for the living among the dead? He is not here; he has risen!", memoryRef: "Luke 24:5-6" },
  // John
  { day: 11, book: "John", chapter: 1,    title: "The Word",                      memoryVerse: "In the beginning was the Word, and the Word was with God, and the Word was God.", memoryRef: "John 1:1" },
  { day: 12, book: "John", chapter: 3,    title: "Born Again",                    memoryVerse: "For God so loved the world that he gave his one and only Son.", memoryRef: "John 3:16" },
  { day: 13, book: "John", chapter: 11,   title: "I Am the Resurrection",         memoryVerse: "I am the resurrection and the life. The one who believes in me will live.", memoryRef: "John 11:25" },
  { day: 14, book: "John", chapter: 14,   title: "The Way, Truth, and Life",      memoryVerse: "I am the way and the truth and the life. No one comes to the Father except through me.", memoryRef: "John 14:6" },
  { day: 15, book: "John", chapter: 17,   title: "Jesus Prays for All Believers", memoryVerse: "My prayer is not for them alone. I pray also for those who will believe in me.", memoryRef: "John 17:20" },
  // Acts
  { day: 16, book: "Acts", chapter: 1,    title: "The Promise of the Spirit",     memoryVerse: "You will receive power when the Holy Spirit comes on you.", memoryRef: "Acts 1:8" },
  { day: 17, book: "Acts", chapter: 2,    title: "Pentecost",                     memoryVerse: "Repent and be baptized, every one of you, in the name of Jesus Christ.", memoryRef: "Acts 2:38" },
  // Romans
  { day: 18, book: "Romans", chapter: 1,  title: "The Gospel's Power",            memoryVerse: "I am not ashamed of the gospel, because it is the power of God.", memoryRef: "Romans 1:16" },
  { day: 19, book: "Romans", chapter: 3,  title: "Righteousness Through Faith",   memoryVerse: "For all have sinned and fall short of the glory of God.", memoryRef: "Romans 3:23" },
  { day: 20, book: "Romans", chapter: 5,  title: "Peace With God",                memoryVerse: "Therefore, since we have been justified through faith, we have peace with God.", memoryRef: "Romans 5:1" },
  { day: 21, book: "Romans", chapter: 6,  title: "Dead to Sin, Alive in Christ",  memoryVerse: "The wages of sin is death, but the gift of God is eternal life in Christ Jesus.", memoryRef: "Romans 6:23" },
  { day: 22, book: "Romans", chapter: 8,  title: "Life in the Spirit",            memoryVerse: "And we know that in all things God works for the good of those who love him.", memoryRef: "Romans 8:28" },
  { day: 23, book: "Romans", chapter: 10, title: "The Word is Near You",          memoryVerse: "If you declare with your mouth, 'Jesus is Lord,' and believe in your heart, you will be saved.", memoryRef: "Romans 10:9" },
  { day: 24, book: "Romans", chapter: 12, title: "Living Sacrifices",             memoryVerse: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind.", memoryRef: "Romans 12:2" },
  // 1 Corinthians
  { day: 25, book: "1 Corinthians", chapter: 13, title: "The Love Chapter",       memoryVerse: "And now these three remain: faith, hope and love. But the greatest of these is love.", memoryRef: "1 Corinthians 13:13" },
  { day: 26, book: "1 Corinthians", chapter: 15, title: "The Resurrection",       memoryVerse: "Where, O death, is your victory? Where, O death, is your sting?", memoryRef: "1 Corinthians 15:55" },
  // 2 Corinthians
  { day: 27, book: "2 Corinthians", chapter: 5,  title: "New Creation",           memoryVerse: "Therefore, if anyone is in Christ, the new creation has come.", memoryRef: "2 Corinthians 5:17" },
  { day: 28, book: "2 Corinthians", chapter: 12, title: "Power in Weakness",      memoryVerse: "My grace is sufficient for you, for my power is made perfect in weakness.", memoryRef: "2 Corinthians 12:9" },
  // Galatians
  { day: 29, book: "Galatians", chapter: 5,  title: "Fruit of the Spirit",        memoryVerse: "The fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness.", memoryRef: "Galatians 5:22" },
  // Ephesians
  { day: 30, book: "Ephesians", chapter: 2,  title: "Saved by Grace",             memoryVerse: "For it is by grace you have been saved, through faith — and this is not from yourselves.", memoryRef: "Ephesians 2:8" },
  { day: 31, book: "Ephesians", chapter: 6,  title: "The Armour of God",          memoryVerse: "Put on the full armour of God, so that you can take your stand against the devil's schemes.", memoryRef: "Ephesians 6:11" },
  // Philippians
  { day: 32, book: "Philippians", chapter: 4, title: "The Peace of God",          memoryVerse: "I can do all this through him who gives me strength.", memoryRef: "Philippians 4:13" },
  // Colossians
  { day: 33, book: "Colossians", chapter: 3,  title: "Set Your Minds on Things Above", memoryVerse: "Set your minds on things above, not on earthly things.", memoryRef: "Colossians 3:2" },
  // 1 Thessalonians
  { day: 34, book: "1 Thessalonians", chapter: 4, title: "The Lord's Coming",    memoryVerse: "Be joyful always; pray continually; give thanks in all circumstances.", memoryRef: "1 Thessalonians 5:16-17" },
  { day: 35, book: "1 Thessalonians", chapter: 5, title: "Children of Light",    memoryVerse: "Do not quench the Spirit.", memoryRef: "1 Thessalonians 5:19" },
  // 2 Timothy
  { day: 36, book: "2 Timothy", chapter: 3,  title: "All Scripture is God-Breathed", memoryVerse: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.", memoryRef: "2 Timothy 3:16" },
  // Hebrews
  { day: 37, book: "Hebrews", chapter: 11, title: "Faith Hall of Fame",           memoryVerse: "Now faith is confidence in what we hope for and assurance about what we do not see.", memoryRef: "Hebrews 11:1" },
  { day: 38, book: "Hebrews", chapter: 12, title: "Run the Race",                 memoryVerse: "Let us run with perseverance the race marked out for us, fixing our eyes on Jesus.", memoryRef: "Hebrews 12:1-2" },
  // James
  { day: 39, book: "James", chapter: 1,   title: "Trials and Temptations",        memoryVerse: "If any of you lacks wisdom, you should ask God, who gives generously to all.", memoryRef: "James 1:5" },
  { day: 40, book: "James", chapter: 2,   title: "Faith and Deeds",               memoryVerse: "Faith without deeds is dead.", memoryRef: "James 2:26" },
  // 1 Peter
  { day: 41, book: "1 Peter", chapter: 5, title: "Humble Yourselves",             memoryVerse: "Humble yourselves, therefore, under God's mighty hand, that he may lift you up.", memoryRef: "1 Peter 5:6" },
  // 1 John
  { day: 42, book: "1 John", chapter: 1,  title: "Walking in the Light",          memoryVerse: "If we confess our sins, he is faithful and just and will forgive us our sins.", memoryRef: "1 John 1:9" },
  { day: 43, book: "1 John", chapter: 4,  title: "God is Love",                   memoryVerse: "We love because he first loved us.", memoryRef: "1 John 4:19" },
  // Revelation
  { day: 44, book: "Revelation", chapter: 1,  title: "The Revelation of Jesus",   memoryVerse: "I am the Alpha and the Omega, the First and the Last, the Beginning and the End.", memoryRef: "Revelation 1:8" },
  { day: 45, book: "Revelation", chapter: 3,  title: "Letters to the Churches",   memoryVerse: "Here I am! I stand at the door and knock.", memoryRef: "Revelation 3:20" },
  { day: 46, book: "Revelation", chapter: 4,  title: "The Throne in Heaven",      memoryVerse: "You are worthy, our Lord and God, to receive glory and honor and power.", memoryRef: "Revelation 4:11" },
  { day: 47, book: "Revelation", chapter: 7,  title: "The Great Multitude",       memoryVerse: "Salvation belongs to our God, who sits on the throne, and to the Lamb.", memoryRef: "Revelation 7:10" },
  { day: 48, book: "Revelation", chapter: 12, title: "The Dragon Defeated",       memoryVerse: "They triumphed over him by the blood of the Lamb and by the word of their testimony.", memoryRef: "Revelation 12:11" },
  { day: 49, book: "Revelation", chapter: 19, title: "The King of Kings",         memoryVerse: "King of Kings and Lord of Lords.", memoryRef: "Revelation 19:16" },
  { day: 50, book: "Revelation", chapter: 21, title: "A New Heaven and Earth",    memoryVerse: "He will wipe every tear from their eyes. There will be no more death.", memoryRef: "Revelation 21:4" },
  // Bonus: going deeper
  { day: 51, book: "John", chapter: 4,    title: "True Worship",                  memoryVerse: "God is spirit, and his worshipers must worship in Spirit and in truth.", memoryRef: "John 4:24" },
  { day: 52, book: "John", chapter: 6,    title: "Bread of Life",                 memoryVerse: "I am the bread of life. Whoever comes to me will never go hungry.", memoryRef: "John 6:35" },
  { day: 53, book: "John", chapter: 10,   title: "The Good Shepherd",             memoryVerse: "I have come that they may have life, and have it to the full.", memoryRef: "John 10:10" },
  { day: 54, book: "John", chapter: 15,   title: "The Vine and the Branches",     memoryVerse: "I am the vine; you are the branches.", memoryRef: "John 15:5" },
  { day: 55, book: "Romans", chapter: 15, title: "Living to Please Others",       memoryVerse: "May the God of hope fill you with all joy and peace as you trust in him.", memoryRef: "Romans 15:13" },
  { day: 56, book: "Ephesians", chapter: 1, title: "Spiritual Blessings",         memoryVerse: "In him we have redemption through his blood, the forgiveness of sins.", memoryRef: "Ephesians 1:7" },
  { day: 57, book: "Philippians", chapter: 2, title: "Imitating Christ",          memoryVerse: "Do nothing out of selfish ambition or vain conceit. In humility value others above yourselves.", memoryRef: "Philippians 2:3" },
  { day: 58, book: "Colossians", chapter: 1, title: "The Supremacy of Christ",   memoryVerse: "He is before all things, and in him all things hold together.", memoryRef: "Colossians 1:17" },
  { day: 59, book: "Hebrews", chapter: 4,   title: "The Sabbath Rest",            memoryVerse: "For the word of God is alive and active. Sharper than any double-edged sword.", memoryRef: "Hebrews 4:12" },
  { day: 60, book: "Revelation", chapter: 22, title: "I Am Coming Soon",          memoryVerse: "Come, Lord Jesus.", memoryRef: "Revelation 22:20" },
];

export const STUDY_PLANS: StudyPlan[] = [
  {
    id: "30-days-jesus",
    title: "30 Days with Jesus",
    titleSw: "Siku 30 na Yesu",
    description: "Journey through the Gospel of Mark and key passages of John to walk closely with Jesus.",
    descriptionSw: "Safari kupitia Injili ya Marko na sehemu muhimu za Yohana ili kutembea karibu na Yesu.",
    totalDays: 30,
    icon: "✝️",
    chapters: MARK_PLAN,
  },
  {
    id: "psalms-21",
    title: "Psalms in 21 Days",
    titleSw: "Zaburi kwa Siku 21",
    description: "21 of the most beloved Psalms — from lament to praise, from fear to faith.",
    descriptionSw: "Zaburi 21 za kupendwa sana — kutoka maombolezo hadi sifa, kutoka hofu hadi imani.",
    totalDays: 21,
    icon: "📖",
    chapters: PSALMS_PLAN,
  },
  {
    id: "acts-28",
    title: "Book of Acts",
    titleSw: "Kitabu cha Matendo",
    description: "Follow the early church's explosive growth over 28 chapters in 28 days.",
    descriptionSw: "Fuata ukuaji wa kanisa la mapema kupitia sura 28 kwa siku 28.",
    totalDays: 28,
    icon: "🔥",
    chapters: ACTS_PLAN,
  },
  {
    id: "nt-essentials",
    title: "New Testament Essentials",
    titleSw: "Muhimu wa Agano Jipya",
    description: "60 essential New Testament chapters covering the core teachings of the faith.",
    descriptionSw: "Sura 60 muhimu za Agano Jipya zinazofunika mafundisho ya msingi ya imani.",
    totalDays: 60,
    icon: "⭐",
    chapters: NT_ESSENTIALS,
  },
];

// ── Helper Functions ──────────────────────────────────────────────────────────

/** Returns how many days have elapsed since enrollment (capped at totalDays) */
export function getProgressDays(enrollmentDate: string, totalDays: number): number {
  const enrolled = new Date(enrollmentDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const elapsed = Math.floor((today.getTime() - enrolled.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(elapsed, totalDays));
}

/** Returns today's chapter for a given plan based on enrollment date, or null if plan is complete */
export function getTodayChapter(plan: StudyPlan, enrollmentDate: string): StudyPlanChapter | null {
  const dayIndex = getProgressDays(enrollmentDate, plan.totalDays);
  if (dayIndex >= plan.totalDays) return null;
  return plan.chapters.find((c) => c.day === dayIndex + 1) ?? null;
}
