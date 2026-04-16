/**
 * fix-vat-to-ht.js
 * Maison Corleone — Remplace TOUTES les variantes "excl. VAT / excl. tax / VAT"
 * par "HT" dans les champs Description (FR) ET "description anglais" (EN).
 *
 * Raison : le script précédent avait mis "excl. tax" dans les descriptions EN.
 * L'instruction finale est : "HT" partout, sur tous les champs.
 */

const https = require('https');
const path  = require('path');
const fs    = require('fs');

// ─── .env ─────────────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) { console.error('❌ .env introuvable'); process.exit(1); }
for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  if (!process.env[k]) process.env[k] = t.slice(eq + 1).trim();
}

const TOKEN    = process.env.AIRTABLE_TOKEN;
const BASE_ID  = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID;
if (!TOKEN || !BASE_ID || !TABLE_ID) { console.error('❌ Variables Airtable manquantes'); process.exit(1); }

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return httpGet(res.headers.location, headers).then(resolve).catch(reject);
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
  });
}

function airtablePatch(recordId, fields) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ fields });
    const opts = {
      hostname: 'api.airtable.com',
      path: `/v0/${BASE_ID}/${TABLE_ID}/${recordId}`,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(Buffer.concat(chunks).toString()));
        else reject(new Error(`PATCH ${res.statusCode}: ${Buffer.concat(chunks).toString()}`));
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Fetch all ────────────────────────────────────────────────────────────────
async function fetchAll() {
  const records = [];
  let offset = null;
  let page = 1;
  do {
    let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`
      + `?fields%5B%5D=NOM&fields%5B%5D=Description&fields%5B%5D=description+anglais&pageSize=100`;
    if (offset) url += `&offset=${encodeURIComponent(offset)}`;
    const { status, body } = await httpGet(url, { Authorization: `Bearer ${TOKEN}` });
    if (status !== 200) throw new Error(`GET page ${page} → HTTP ${status}: ${body.toString()}`);
    const data = JSON.parse(body.toString());
    records.push(...(data.records || []));
    offset = data.offset || null;
    page++;
    if (offset) await sleep(250);
  } while (offset);
  return records;
}

// ─── Nettoyage : toutes variantes → HT ───────────────────────────────────────
function normalize(text) {
  if (!text) return null;
  let t = text;

  // Toutes les variantes casse-insensible → HT
  t = t.replace(/RETAIL PRICE EXCL\.\s*TAX/gi, 'Prix HT');
  t = t.replace(/RETAIL PRICE EXCL\.\s*VAT/gi, 'Prix HT');
  t = t.replace(/Retail price excl\.\s*tax/gi, 'Prix HT');
  t = t.replace(/Retail price excl\.\s*VAT/gi, 'Prix HT');
  t = t.replace(/Price excl\.\s*tax/gi, 'Prix HT');
  t = t.replace(/Price excl\.\s*VAT/gi, 'Prix HT');
  t = t.replace(/excl\.\s*tax/gi, 'HT');
  t = t.replace(/excl\.\s*VAT/gi, 'HT');
  t = t.replace(/\bVAT\b/g, 'HT');

  t = t.replace(/\s{2,}/g, ' ').trim();
  return t === text ? null : t;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MAISON CORLEONE — Remplacement excl.VAT/excl.tax → HT (Airtable)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const records = await fetchAll();
  console.log(`${records.length} produits récupérés.\n`);

  let corrected = 0, skipped = 0, errors = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const nom = (r.fields.NOM || r.id || '').toString().trim();
    const descFR = r.fields['Description'] || '';
    const descEN = r.fields['description anglais'] || '';

    const fixedFR = normalize(descFR);
    const fixedEN = normalize(descEN);

    if (!fixedFR && !fixedEN) {
      console.log(`⏭️  [${i+1}/${records.length}] ${nom} → propre`);
      skipped++;
      continue;
    }

    const fields = {};
    const changes = [];
    if (fixedFR) { fields['Description'] = fixedFR; changes.push('FR'); }
    if (fixedEN) { fields['description anglais'] = fixedEN; changes.push('EN'); }

    try {
      await airtablePatch(r.id, fields);
      console.log(`✅ [${i+1}/${records.length}] ${nom} → corrigé (${changes.join('+')})`);
      corrected++;
    } catch (err) {
      console.error(`❌ [${i+1}/${records.length}] ${nom} → ${err.message}`);
      errors++;
    }

    await sleep(250);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`TERMINÉ — ${corrected} corrigés / ${skipped} propres / ${errors} erreurs`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  if (errors > 0) process.exit(1);
}

main().catch(err => { console.error('💥', err.message); process.exit(1); });
