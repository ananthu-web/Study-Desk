import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const paths = JSON.parse(await readFile(new URL("../components/study-book-paths.json", import.meta.url), "utf8"));

// One vector source for browser, iPhone, and installable app icons.
function iconSvg(maskable = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#254a3c"/>
    <g transform="${maskable ? "translate(256 256) scale(.74) translate(-256 -256)" : "translate(0 0)"}" fill="none" stroke="#f2f0df" stroke-linecap="round" stroke-linejoin="round">
      <path stroke-width="27" d="${paths.left}${paths.right}${paths.spine}"/>
      <path stroke-width="15" d="${paths.leftLines}${paths.rightLines}"/>
    </g>
  </svg>`;
}

await writeFile(new URL("../app/icon.svg", import.meta.url), iconSvg());
for (const [file, size, maskable] of [
  ["app/apple-icon.png", 180, false],
  ["public/icons/icon-192.png", 192, false],
  ["public/icons/icon-512.png", 512, false],
  ["public/icons/maskable-512.png", 512, true],
]) {
  await sharp(Buffer.from(iconSvg(maskable))).resize(size, size).png().toFile(new URL(`../${file}`, import.meta.url).pathname);
}
console.log("Generated StudyDesk icons with book page lines.");
