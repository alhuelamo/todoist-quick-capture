const sharp = require("sharp");
const path = require("path");

const SIZES = [16, 48, 128];

// 3 stacked checkmarks, left-aligned, on a 128x128 grid
const CHECKMARKS = [
  "M -9,38 L 15,58 L 87,28",
  "M -9,58 L 15,78 L 87,48",
  "M -9,78 L 15,98 L 87,68",
];

function buildSvg(size) {
  const radius = Math.round(size * 0.22);
  const checks = CHECKMARKS.map(
    (d) => `<path d="${d}" stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
  ).join("\n  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="${radius}" ry="${radius}" fill="#db4035"/>
  ${checks}
</svg>`;
}

async function generate() {
  for (const size of SIZES) {
    const svg = Buffer.from(buildSvg(size));
    const outPath = path.join(__dirname, `../icons/icon${size}.png`);
    await sharp(svg).png().toFile(outPath);
    console.log(`Generated icon${size}.png`);
  }
}

generate();
