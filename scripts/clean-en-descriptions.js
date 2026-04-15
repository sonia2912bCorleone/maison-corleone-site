/**
 * clean-en-descriptions.js
 * Maison Corleone — Nettoyage doublons "All colors and dimensions..."
 * dans le champ "description anglais" uniquement.
 *
 * Règle : si la phrase apparaît plus d'une fois → garder UNE seule fois à la fin.
 * Ne touche à rien d'autre.
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// ─── Chargement .env ──────────────────────────────────────────────────────────
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

const TOKEN   = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID;
const PHRASE  = 'All colors and dimensions are customizable upon request';

if (!TOKEN || !BASE_ID || !TABLE_ID) {
  console.error('❌ Variables Airtable manquantes'); process.exit(1);
}

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

// ─── Récupère TOUS les produits ───────────────────────────────────────────────
async function fetchAll() {
  const records = [];
  let offset = null;
  let page = 1;
  do {
    let url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`
      + `?fields%5B%5D=NOM&fields%5B%5D=description+anglais&pageSize=100`;
    if (offset) url += `&offset=${encodeURIComponent(offset)}`;
    const { status, body } = await httpGet(url, { Authorization: `Bearer ${TOKEN}` });
    if (status !== 200) throw new Error(`GET page ${page} → HTTP ${status}`);
    const data = JSON.parse(body.toString());
    records.push(...(data.records || []));
    offset = data.offset || null;
    page++;
    if (offset) await sleep(250);
  } while (offset);
  return records;
}

// ─── Nettoyage d'une description ─────────────────────────────────────────────
function clean(text) {
  if (!text) return null;
  // Compter les occurrences
  const count = (text.split(PHRASE).length - 1);
  if (count <= 1) return null; // propre
  // Supprimer toutes les occurrences (avec espace avant si présent)
  let cleaned = text.split(PHRASE).join(' ').replace(/\s{2,}/g, ' ').trim();
  // Rajouter UNE fois à la fin
  cleaned = cleaned.replace(/[.,\s]+$/, '') + '. ' + PHRASE + '.';
  return cleaned;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  MAISON CORLEONE — Nettoyage doublons "description anglais"');
  console.log('═══════════════════════════════════════════════════════════\n');

  const records = await fetchAll();
  console.log(`${records.length} produits récupérés.\n`);

  let corrected = 0, skipped = 0, errors = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const nom = (r.fields.NOM || r.id).trim();
    const descEn = r.fields['description anglais'] || '';

    const fixed = clean(descEn);
    if (!fixed) {
      console.log(`⏭️  [${i+1}/${records.length}] ${nom} → propre, skippé`);
      skipped++;
      continue;
    }

    try {
      await airtablePatch(r.id, { 'description anglais': fixed });
      console.log(`✅ [${i+1}/${records.length}] ${nom} → doublon supprimé`);
      corrected++;
    } catch (err) {
      console.error(`❌ [${i+1}/${records.length}] ${nom} → ${err.message}`);
      errors++;
    }

    await sleep(250);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`TERMINÉ — ${corrected} corrigés / ${skipped} skippés / ${errors} erreurs`);
  console.log('═══════════════════════════════════════════════════════════\n');
  if (errors > 0) process.exit(1);
}

main().catch(err => { console.error('💥', err.message); process.exit(1); });
