const fs = require('fs');

const lightSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF"/>
      <stop offset="100%" style="stop-color:#F5F5F5"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <text x="256" y="340" font-family="Georgia,serif" font-size="280" font-weight="400" fill="#0A0A0A" text-anchor="middle">F</text>
</svg>`;

const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#18181B"/>
      <stop offset="100%" style="stop-color:#0A0A0A"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <text x="256" y="340" font-family="Georgia,serif" font-size="280" font-weight="400" fill="#FFFFFF" text-anchor="middle">F</text>
</svg>`;

fs.writeFileSync('public/logos/light.svg', lightSvg);
fs.writeFileSync('public/logos/dark.svg', darkSvg);
console.log('SVG logos created');
