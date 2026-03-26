/**
 * Build-time script: scans /steder/ folders, parses informasjon.txt,
 * detects images, and generates public/generert/steder.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const STEDER_DIR = path.join(ROOT, "steder");
const OUTPUT_DIR = path.join(ROOT, "public", "generert");
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".jfif"];

function parseInformasjon(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const data = {};

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const idx = line.indexOf(":");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();

    if (key && val) {
      data[key] = val;
    }
  }

  return data;
}

function detectImages(folderPath, folderName) {
  return fs
    .readdirSync(folderPath)
    .filter((file) => IMAGE_EXTS.includes(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((file) => `steder/${folderName}/${file}`);
}

async function tryExifGps(imagePath) {
  try {
    const exifr = await import("exifr");
    const gps = await exifr.gps(imagePath);

    if (gps && gps.latitude && gps.longitude) {
      return {
        breddegrad: gps.latitude,
        lengdegrad: gps.longitude,
      };
    }
  } catch {
    // ignore EXIF errors
  }

  return null;
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getPrimaryImage(meta, folder, bilder) {
  if (meta.forsidebilde) {
    const candidate = `steder/${folder}/${meta.forsidebilde}`;
    if (bilder.includes(candidate)) {
      return candidate;
    }
  }

  return bilder[0] || null;
}

async function main() {
  if (!fs.existsSync(STEDER_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUTPUT_DIR, "steder.json"), "[]");
    console.log("No steder/ directory found. Generated empty steder.json");
    return;
  }

  const folders = fs
    .readdirSync(STEDER_DIR)
    .filter((entry) => fs.statSync(path.join(STEDER_DIR, entry)).isDirectory())
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const steder = [];

  for (const folder of folders) {
    const folderPath = path.join(STEDER_DIR, folder);
    const infoPath = path.join(folderPath, "informasjon.txt");

    const meta = fs.existsSync(infoPath) ? parseInformasjon(infoPath) : {};
    const bilder = detectImages(folderPath, folder);

    if ((!meta.breddegrad || !meta.lengdegrad) && bilder.length > 0) {
      const firstImagePath = path.join(ROOT, bilder[0]);

      if (fs.existsSync(firstImagePath)) {
        const exifCoords = await tryExifGps(firstImagePath);

        if (exifCoords) {
          if (!meta.breddegrad) meta.breddegrad = String(exifCoords.breddegrad);
          if (!meta.lengdegrad) meta.lengdegrad = String(exifCoords.lengdegrad);
        }
      }
    }

    const forsidebilde = getPrimaryImage(meta, folder, bilder);

    steder.push({
      id: meta.id || folder,
      mappe: folder,
      tittel: meta.tittel || folder,
      land: meta.land || null,
      by: meta.by || null,
      sted: meta.sted || null,
      dato: meta.dato || null,
      beskrivelse: meta.beskrivelse || null,
      morsom_fakta: meta.morsom_fakta || null,
      breddegrad: parseOptionalNumber(meta.breddegrad),
      lengdegrad: parseOptionalNumber(meta.lengdegrad),
      rekkefolge: parseOptionalNumber(meta.rekkefolge),
      forsidebilde,
      bilder,
    });
  }

  steder.sort((a, b) => {
    const aOrder = a.rekkefolge ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.rekkefolge ?? Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    if (a.dato && b.dato && a.dato !== b.dato) {
      return a.dato.localeCompare(b.dato);
    }

    return a.tittel.localeCompare(b.tittel, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "steder.json"),
    JSON.stringify(steder, null, 2)
  );

  console.log(`Genererte ${steder.length} steder til public/generert/steder.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
