import { copyFile, mkdir, cp } from "node:fs/promises";
await mkdir(new URL("../public/", import.meta.url), { recursive: true });
await copyFile(new URL("../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url), new URL("../public/pdf.worker.min.mjs", import.meta.url));

for (const name of ["cmaps", "standard_fonts", "wasm"]) await cp(new URL(`../node_modules/pdfjs-dist/${name}/`, import.meta.url), new URL(`../public/pdfjs/${name}/`, import.meta.url), { recursive: true });
