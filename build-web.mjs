import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve("www");
await mkdir(outputDirectory, { recursive: true });

for (const file of ["index.html", "style.css", "app.js"]) {
  await copyFile(resolve(file), resolve(outputDirectory, file));
}

console.log("Arquivos web preparados para o aplicativo Android.");
