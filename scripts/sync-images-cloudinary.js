/**
 * sync-images-cloudinary.js
 * Maison Corleone — Synchronisation images Airtable → Cloudinary
 *
 * Comportement :
 *  - Récupère TOUS les produits Airtable (pagination complète)
 *  - ImageURL remplie → skip
 *  - ImageURL vide → télécharge depuis Images → upload Cloudinary → PATCH Airtable
 *  - Ne s'arrête jamais sur une erreur : logger et continuer
 *  - Résumé final : X traités / Y skippés / Z erreurs
 */

const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

// ─── Chargement .env ─────────────────────────────────────────────────────────
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env introuvable à', envPath);
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

// ─── Vérification variables obligatoires ─────────────────────────────────────
const REQUIRED = [
  'AIRTABLE_TOKEN',
  'AIRTABLE_BASE_ID',
  'AIRTABLE_TABLE_ID',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error('\n❌ Variables manquantes dans .env :');
  missing.forEach((k) => console.error(`   → ${k}`));
  console.error('\nAjoutez ces variables dans le fichier .env et relancez.\n');
  process.exit(1);
}

const AIRTABLE_TOKEN    = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID  = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID;
const CLOUD_NAME        = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUD_API_KEY     = process.env.CLOUDINARY_API_KEY;
const CLOUD_API_SECRET  = process.env.CLOUDINARY_API_SECRET;

// ─── Helpers HTTP ─────────────────────────────────────────────────────────────

/** GET JSON avec headers */
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout GET')); });
  });
}

/** Télécharge une image → Buffer */
async function downloadImage(url) {
  const { status, body } = await httpGet(url);
  if (status !== 200) throw new Error(`HTTP ${status} lors du téléchargement`);
  return body;
}

/** PATCH Airtable */
function airtablePatch(recordId, fields) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ fields });
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${recordId}`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } else {
          reject(new Error(`Airtable PATCH ${res.statusCode}: ${Buffer.concat(chunks).toString()}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/** Upload vers Cloudinary via l'API upload (multipart/form-data) */
function uploadToCloudinary(imageBuffer, publicId) {
  return new Promise((resolve, reject) => {
    const crypto = require('crypto');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = 'maison-corleone';

    // Signature Cloudinary
    const paramString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha1')
      .update(paramString + CLOUD_API_SECRET)
      .digest('hex');

    // Boundary multipart
    const boundary = '----CloudinaryBoundary' + Date.now();
    const CRLF = '\r\n';

    function field(name, value) {
      return (
        `--${boundary}${CRLF}` +
        `Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}` +
        `${value}${CRLF}`
      );
    }

    const prefix = Buffer.from(
      field('api_key', CLOUD_API_KEY) +
      field('timestamp', timestamp) +
      field('folder', folder) +
      field('public_id', publicId) +
      field('signature', signature) +
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="image.jpg"${CRLF}` +
      `Content-Type: image/jpeg${CRLF}${CRLF}`
    );
    const suffix = Buffer.from(`${CRLF}--${boundary}--${CRLF}`);

    const bodyBuffer = Buffer.concat([prefix, imageBuffer, suffix]);

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length,
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        if (res.statusCode === 200) {
          const json = JSON.parse(text);
          resolve(json.secure_url);
        } else {
          reject(new Error(`Cloudinary ${res.statusCode}: ${text}`));
        }
      });
    });
    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });
}

// ─── Airtable : récupère TOUS les produits (pagination complète) ──────────────
async function fetchAllProducts() {
  const products = [];
  let offset = null;
  let page = 1;

  console.log('\n📋 Récupération de tous les produits Airtable...');

  do {
    let url =
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}` +
      `?fields%5B%5D=NOM&fields%5B%5D=Images&fields%5B%5D=ImageURL&pageSize=100`;
    if (offset) url += `&offset=${encodeURIComponent(offset)}`;

    const { status, body } = await httpGet(url, {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    });

    if (status !== 200) {
      throw new Error(`Airtable GET page ${page} → HTTP ${status}: ${body.toString()}`);
    }

    const data = JSON.parse(body.toString());
    const records = data.records || [];
    products.push(...records);
    offset = data.offset || null;

    console.log(`   Page ${page} → ${records.length} produits (total : ${products.length})`);
    page++;

    // Rate limit Airtable : max 5 req/s
    if (offset) await sleep(250);
  } while (offset);

  console.log(`\n✅ ${products.length} produits récupérés au total.\n`);
  return products;
}

// ─── Utilitaires ──────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sanitizePublicId(name) {
  return (name || 'produit')
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   MAISON CORLEONE — Sync Images Cloudinary');
  console.log('   Base :', AIRTABLE_BASE_ID, '| Table :', AIRTABLE_TABLE_ID);
  console.log('   Cloud :', CLOUD_NAME);
  console.log('═══════════════════════════════════════════════════════════════\n');

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  const products = await fetchAllProducts();

  for (let i = 0; i < products.length; i++) {
    const record = products[i];
    const id     = record.id;
    const fields = record.fields || {};
    const nom    = fields.NOM || `produit-${id}`;
    const imageURL = fields.ImageURL || '';
    const images   = fields.Images || [];

    // ── Si ImageURL déjà remplie → skip ──────────────────────────────────────
    if (imageURL && imageURL.trim() !== '') {
      console.log(`⏭️  [${i + 1}/${products.length}] ${nom} → déjà rempli, skippé`);
      skipped++;
      continue;
    }

    // ── Pas d'image en pièce jointe → skip avec warning ──────────────────────
    if (!images || images.length === 0) {
      console.log(`⚠️  [${i + 1}/${products.length}] ${nom} → aucune image pièce jointe, skippé`);
      skipped++;
      continue;
    }

    // ── Traitement : télécharge → upload Cloudinary → PATCH Airtable ─────────
    try {
      const attachmentUrl = images[0].url;
      const publicId = sanitizePublicId(nom) + '-' + id.slice(-6);

      // 1. Télécharger l'image
      const imageBuffer = await downloadImage(attachmentUrl);

      // 2. Upload sur Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(imageBuffer, publicId);

      // 3. PATCH Airtable
      await airtablePatch(id, { ImageURL: cloudinaryUrl });

      console.log(`✅ [${i + 1}/${products.length}] ${nom} → ${cloudinaryUrl}`);
      processed++;
    } catch (err) {
      console.error(`❌ [${i + 1}/${products.length}] ${nom} → erreur : ${err.message}`);
      errors++;
    }

    // Rate limit : pause entre chaque produit traité
    await sleep(300);
  }

  // ─── Résumé final ─────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`TERMINÉ — ${processed} traités / ${skipped} skippés / ${errors} erreurs`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\n💥 Erreur critique :', err.message);
  process.exit(1);
});
