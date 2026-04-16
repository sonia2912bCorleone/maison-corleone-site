/**
 * fix-descriptions.js
 * Maison Corleone — Nettoyage champs Description (FR) et "description anglais" (EN)
 *
 * Actions :
 *  - Supprime caractères parasites : ". _ _ _ ." / "_ _ _" / ". . ." etc.
 *  - EN : "excl. VAT" → "excl. tax", "HT" → "excl. tax"
 *  - FR : "excl. VAT" → "HT", conserve "HT" existant
 *  - PATCH uniquement les produits modifiés
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

const TOKEN    = process.env.AIRTABLE_TOKEN;
const BASE_ID  = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID;

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
      + `?fields%5B%5D=NOM`
      + `&fields%5B%5D=Description`
      + `&fields%5B%5D=description+anglais`
      + `&pageSize=100`;
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

// ─── Nettoyage caractères parasites ──────────────────────────────────────────
function removeJunk(text) {
  if (!text) return text;
  let t = text;
  // Supprime séquences de points et tirets bas : ". _ _ _ ." / "_ _ _" / ". . ."
  t = t.replace(/[._]{2,}/g, ' ');
  t = t.replace(/\s[._]+\s/g, ' ');
  // Nettoie espaces multiples
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t;
}

// ─── Nettoyage description EN ─────────────────────────────────────────────────
function cleanEN(text) {
  if (!text) return null;
  let t = removeJunk(text);

  // Remplacement VAT (case-sensitive, plusieurs variantes)
  t = t.replace(/RETAIL PRICE EXCL\. VAT/g, 'PRICE EXCL. TAX');
  t = t.replace(/Retail price excl\. VAT/g, 'Price excl. tax');
  t = t.replace(/excl\. VAT/gi, 'excl. tax');

  // HT est français — remplacer par excl. tax dans le contexte EN
  // Uniquement quand c'est un label prix standalone (précédé d'€ ou de chiffre, ou en fin de phrase)
  t = t.replace(/\b€\s*HT\b/g, '€ excl. tax');
  t = t.replace(/\bprix\s+HT\b/gi, 'price excl. tax');
  t = t.replace(/\bprice\s+HT\b/gi, 'price excl. tax');
  // HT seul entre parenthèses ou après prix
  t = t.replace(/\(HT\)/g, '(excl. tax)');
  t = t.replace(/\bHT\b/g, 'excl. tax');

  t = t.replace(/\s{2,}/g, ' ').trim();
  return t === text ? null : t;
}

// ─── Nettoyage description FR ─────────────────────────────────────────────────
function cleanFR(text) {
  if (!text) return null;
  let t = removeJunk(text);

  // excl. VAT → HT (le reste reste en français)
  t = t.replace(/excl\. VAT/gi, 'HT');
  // RETAIL PRICE EXCL. VAT → Prix HT
  t = t.replace(/RETAIL PRICE EXCL\. VAT/g, 'Prix HT');
  t = t.replace(/Retail price excl\. VAT/g, 'Prix HT');

  t = t.replace(/\s{2,}/g, ' ').trim();
  return t === text ? null : t;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MAISON CORLEONE — Nettoyage descriptions FR + EN (Airtable)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const records = await fetchAll();
  console.log(`${records.length} produits récupérés.\n`);

  let corrected = 0, skipped = 0, errors = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const nom = (r.fields.NOM || r.id || '(sans nom)').toString().trim();
    const descFR = r.fields['Description'] || '';
    const descEN = r.fields['description anglais'] || '';

    const fixedFR = cleanFR(descFR);
    const fixedEN = cleanEN(descEN);

    if (!fixedFR && !fixedEN) {
      console.log(`⏭️  [${i+1}/${records.length}] ${nom} → propre, skippé`);
      skipped++;
      continue;
    }

    const fields = {};
    const changes = [];
    if (fixedFR) { fields['Description'] = fixedFR; changes.push('FR'); }
    if (fixedEN) { fields['description anglais'] = fixedEN; changes.push('EN'); }

    try {
      await airtablePatch(r.id, fields);
      console.log(`✅ [${i+1}/${records.length}] ${nom} → corrigé (${changes.join(' + ')})`);
      if (fixedFR) console.log(`   FR avant : ${descFR.slice(0, 80)}${descFR.length > 80 ? '…' : ''}`);
      if (fixedFR) console.log(`   FR après : ${fixedFR.slice(0, 80)}${fixedFR.length > 80 ? '…' : ''}`);
      if (fixedEN) console.log(`   EN avant : ${descEN.slice(0, 80)}${descEN.length > 80 ? '…' : ''}`);
      if (fixedEN) console.log(`   EN après : ${fixedEN.slice(0, 80)}${fixedEN.length > 80 ? '…' : ''}`);
      corrected++;
    } catch (err) {
      console.error(`❌ [${i+1}/${records.length}] ${nom} → ERREUR: ${err.message}`);
      errors++;
    }

    await sleep(250); // respect rate limit Airtable (max 5 req/s)
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`TERMINÉ — ${corrected} corrigés / ${skipped} skippés / ${errors} erreurs`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  if (errors > 0) process.exit(1);
}

main().catch(err => { console.error('💥', err.message); process.exit(1); });
