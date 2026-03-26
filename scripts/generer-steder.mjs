/**
 * Build-time script: scans /steder/ folders, parses informasjon.txt,
 * detects images, and generates public/generert/steder.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STEDER_DIR = path.join(ROOT, 'steder');
const OUTPUT_DIR = path.join(ROOT, 'public', 'generert');
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

function parseInformasjon(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = {};
  for (const line of content.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key && val) data[key] = val;
  }
  return data;
}

function detectImages(folderPath, folderName) {
  return fs.readdirSync(folderPath)
    .filter(f => IMAGE_EXTS.includes(path.extname(f).toLowerCase()))
    .sort()
    .map(f => `steder/${folderName}/${f}`);
}

async function tryExifGps(imagePath) {
  try {
    const exifr = await import('exifr');
    const gps = await exifr.gps(imagePath);
    if (gps && gps.latitude && gps.longitude) {
      return { breddegrad: gps.latitude, lengdegrad: gps.longitude };
    }
  } catch { /* no EXIF */ }
  return null;
}

async function main() {
  if (!fs.existsSync(STEDER_DIR)) {
    console.log('No steder/ directory found. Creating empty output.');
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'steder.json'), '[]');
    return;
  }

  const folders = fs.readdirSync(STEDER_DIR)
    .filter(f => fs.statSync(path.join(STEDER_DIR, f)).isDirectory())
    .sort();

  const steder = [];

  for (const folder of folders) {
    const folderPath = path.join(STEDER_DIR, folder);
    const infoPath = path.join(folderPath, 'informasjon.txt');

    const meta = fs.existsSync(infoPath) ? parseInformasjon(infoPath) : {};
    const bilder = detectImages(folderPath, folder);

    // Try EXIF GPS if coordinates missing
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

    const forsidebilde = meta.forsidebilde
      ? `steder/${folder}/${meta.forsidebilde}`
      : bilder[0] || null;

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
      breddegrad: meta.breddegrad ? parseFloat(meta.breddegrad) : null,
      lengdegrad: meta.lengdegrad ? parseFloat(meta.lengdegrad) : null,
      rekkefolge: meta.rekkefolge ? parseInt(meta.rekkefolge, 10) : 999,
      forsidebilde,
      bilder,
    });
  }

  // Sort by rekkefolge, then by dato
  steder.sort((a, b) => {
    if (a.rekkefolge !== b.rekkefolge) return a.rekkefolge - b.rekkefolge;
    if (a.dato && b.dato) return a.dato.localeCompare(b.dato);
    return 0;
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'steder.json'),
    JSON.stringify(steder, null, 2)
  );
  console.log(`Genererte ${steder.length} steder til public/generert/steder.json`);
}

main().catch(console.error);
