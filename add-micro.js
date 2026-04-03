const fs = require('fs');
const path = require('path');

const files = [
  'src/app/[locale]/page.tsx',
  'src/app/[locale]/community/page.tsx',
  'src/app/[locale]/devotions/page.tsx',
  'src/app/[locale]/stories/page.tsx',
  'src/app/[locale]/profile/page.tsx',
  'src/app/[locale]/saved/page.tsx',
  'src/app/[locale]/devotions/journal/page.tsx',
  'src/app/[locale]/devotions/streak/page.tsx',
  'src/app/[locale]/devotions/quiz/page.tsx',
];

files.forEach(f => {
  const fp = path.join(process.cwd(), f);
  if (!fs.existsSync(fp)) {
    console.log('SKIP:', f);
    return;
  }
  let content = fs.readFileSync(fp, 'utf8');
  // Add card-lift to hoverable cards
  content = content.replace(/className="cursor-pointer hover/g, 'className="card-lift cursor-pointer hover');
  // Add page-enter to main content containers
  content = content.replace(/<div className="px-4 py-6 space-y-6">/g, '<div className="px-4 py-6 space-y-6 page-enter">');
  fs.writeFileSync(fp, content);
  console.log('OK:', f);
});
