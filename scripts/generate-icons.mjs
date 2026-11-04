import sharp from "sharp";
import { writeFile } from "node:fs/promises";

// One vector source for browser, iPhone, and installable app icons.
function iconSvg(maskable = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#254a3c"/>
    <g transform="${maskable ? "translate(256 256) scale(.74) translate(-256 -256)" : "translate(0 0)"}" fill="none" stroke="#f2f0df" stroke-linecap="round" stroke-linejoin="round">
      <path stroke-width="27" d="M80 104C152 88 208 104 256 152C304 104 360 88 432 104V408C360 392 304 408 256 440C208 408 152 392 80 408V104ZM256 152V440"/>
      <path stroke-width="15" d="M124 174C163 171 190 179 212 193M124 238C163 235 190 243 212 257M124 302C163 299 190 307 212 321M300 193C322 179 349 171 388 174M300 257C322 243 349 235 388 238M300 321C322 307 349 299 388 302"/>
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
