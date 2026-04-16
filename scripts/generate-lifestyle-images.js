require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { fal } = require('@fal-ai/client');
const cloudinary = require('cloudinary').v2;
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── CONFIGURATION ───────────────────────────────────────────
fal.config({ credentials: process.env.FAL_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE  = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE_ID;
const AIRTABLE_URL   = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  'Content-Type': 'application/json',
};

// ─── VÉRIFICATION VARS OBLIGATOIRES ─────────────────────────
function checkEnv() {
  const required = {
    FAL_API_KEY: process.env.FAL_API_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    AIRTABLE_TOKEN: process.env.AIRTABLE_TOKEN,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    AIRTABLE_TABLE_ID: process.env.AIRTABLE_TABLE_ID,
  };
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    console.error('\n❌ Variables manquantes dans .env :');
    missing.forEach(k => console.error(`   - ${k}`));
    console.error('\n👉 Ajouter ces variables dans le fichier .env et relancer.\n');
    process.exit(1);
  }
}

// ─── PROMPTS PAR CATÉGORIE ────────────────────────────────────
function getLifestylePrompt(productName, categories) {
  const cat = (categories || '').toLowerCase();

  const base = `no people, no text, no logos, ultra-realistic
    interior photography, 8K quality, editorial luxury magazine style,
    warm ambient lighting, premium hospitality design`;

  if (cat.includes('salon') || cat.includes('canapé') || cat.includes('sofa')) {
    return `Luxury five-star hotel lobby interior, Abu Dhabi,
      ${productName} as statement centerpiece, Italian marble floor,
      white orchids, gold accents, sheer curtains, ${base}`;
  }

  if (cat.includes('chambre') || cat.includes('lit') || cat.includes('bedroom')) {
    return `High-end royal suite interior, Dubai luxury hotel,
      morning golden light through floor-to-ceiling windows,
      ${productName} perfectly styled, Egyptian cotton linen,
      private terrace with city skyline, ${base}`;
  }

  if (cat.includes('extérieur') || cat.includes('outdoor') || cat.includes('garden')) {
    return `Luxury private villa terrace, Saudi Arabia desert resort,
      sunset golden hour, ${productName} with premium cushions,
      infinity pool and desert landscape in background, ${base}`;
  }

  if (cat.includes('salle') || cat.includes('manger') || cat.includes('dining')) {
    return `Prestigious private dining room, Riyadh luxury residence,
      ${productName} set for eight guests, dramatic crystal pendant lighting,
      white tablecloth, crystal glasses, floral centerpiece, ${base}`;
  }

  if (cat.includes('décoration') || cat.includes('luminaire') || cat.includes('deco')) {
    return `Grand entrance hall, luxury palace interior, Middle East,
      ${productName} as focal statement piece, marble columns,
      gold architectural details, dramatic lighting, ${base}`;
  }

  if (cat.includes('bureau') || cat.includes('office') || cat.includes('travail')) {
    return `Executive private office, luxury tower Riyadh,
      ${productName} as centerpiece, floor-to-ceiling city view,
      dark wood paneling, leather accents, ${base}`;
  }

  if (cat.includes('spa') || cat.includes('bien') || cat.includes('wellness')) {
    return `Luxury spa suite, five-star resort Middle East,
      ${productName} styled with white towels and orchids,
      natural stone walls, candlelight ambiance, ${base}`;
  }

  // Default premium
  return `Luxury interior design, premium private residence,
    ${productName} as elegant centerpiece, warm golden lighting,
    marble surfaces, curated art pieces in background, ${base}`;
}

// ─── AIRTABLE — RÉCUPÉRER TOUS LES PRODUITS ──────────────────
async function getAllProducts() {
  const products = [];
  let offset = null;

  do {
    const url = offset
      ? `${AIRTABLE_URL}?pageSize=100&offset=${offset}`
      : `${AIRTABLE_URL}?pageSize=100`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Airtable fetch error: ${res.status}`);
    const data = await res.json();

    products.push(...data.records);
    offset = data.offset || null;

    if (offset) await sleep(250); // Rate limit Airtable
  } while (offset);

  console.log(`📦 ${products.length} produits récupérés depuis Airtable`);
  return products;
}

// ─── AIRTABLE — METTRE À JOUR ImageLifestyle1 ────────────────
async function patchImageLifestyle(recordId, imageUrl) {
  const res = await fetch(`${AIRTABLE_URL}/${recordId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      fields: { ImageLifestyle1: imageUrl }
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PATCH failed: ${err}`);
  }
}

// ─── FAL.AI — GÉNÉRER UNE IMAGE ──────────────────────────────
async function generateImage(prompt) {
  const result = await fal.subscribe('fal-ai/flux-pro', {
    input: {
      prompt,
      image_size: 'landscape_4_3',
      num_inference_steps: 28,
      num_images: 1,
      safety_tolerance: '2',
      output_format: 'jpeg',
    },
    logs: false,
  });

  // Le client fal.ai peut wrapper la réponse dans .data ou retourner directement
  const output = result?.data ?? result;
  const imageUrl = output?.images?.[0]?.url
    ?? output?.image?.url
    ?? output?.url;

  if (!imageUrl) {
    // Log la structure réelle pour diagnostic
    console.error('\n  [DEBUG fal.ai result]:', JSON.stringify(result, null, 2).substring(0, 500));
    throw new Error('Aucune image retournée par fal.ai');
  }

  return imageUrl;
}

// ─── CLOUDINARY — UPLOADER UNE IMAGE ─────────────────────────
async function uploadToCloudinary(imageUrl, productName) {
  const publicId = `maison-corleone-lifestyle/${productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60)}-lifestyle`;

  const result = await cloudinary.uploader.upload(imageUrl, {
    public_id: publicId,
    folder: 'maison-corleone-lifestyle',
    overwrite: false,
    resource_type: 'image',
    quality: 'auto:best',
    fetch_format: 'auto',
  });

  return result.secure_url;
}

// ─── UTILITAIRES ──────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getField(record, field) {
  return record.fields?.[field] || '';
}

// ─── MAIN — PIPELINE COMPLET ──────────────────────────────────
async function main() {
  checkEnv();

  console.log('\n🎨 GÉNÉRATION IMAGES LIFESTYLE — MAISON CORLEONE');
  console.log('================================================\n');

  const stats = { traites: 0, skipped: 0, erreurs: 0 };
  const errors = [];

  // 1. Récupérer tous les produits
  const products = await getAllProducts();

  // 2. Filtrer ceux sans ImageLifestyle1
  const toProcess = products.filter(p => !getField(p, 'ImageLifestyle1'));
  const already   = products.length - toProcess.length;

  console.log(`✅ ${already} produits déjà traités — skippés`);
  console.log(`🔄 ${toProcess.length} produits à générer\n`);

  if (toProcess.length === 0) {
    console.log('🎉 Tous les produits ont déjà une image lifestyle !');
    return;
  }

  // 3. Traiter chaque produit
  for (let i = 0; i < toProcess.length; i++) {
    const product = toProcess[i];
    const nom        = getField(product, 'NOM') || `Produit ${i + 1}`;
    const categories = getField(product, 'CATEGORIES');
    const recordId   = product.id;

    process.stdout.write(
      `[${i + 1}/${toProcess.length}] ${nom} (${categories || 'sans catégorie'})... `
    );

    try {
      // Générer le prompt adapté
      const prompt = getLifestylePrompt(nom, categories);

      // Générer l'image via fal.ai
      const falUrl = await generateImage(prompt);

      // Uploader sur Cloudinary (avant de patcher Airtable)
      const cloudinaryUrl = await uploadToCloudinary(falUrl, nom);

      // Mettre à jour Airtable seulement si Cloudinary OK
      await patchImageLifestyle(recordId, cloudinaryUrl);

      console.log(`✅ OK → ${cloudinaryUrl.substring(0, 60)}...`);
      stats.traites++;

      // Pause entre chaque produit
      await sleep(2000);

    } catch (err) {
      console.log(`❌ ERREUR → ${err.message}`);
      errors.push({ nom, erreur: err.message });
      stats.erreurs++;
      await sleep(1000);
    }
  }

  // 4. Résumé final
  console.log('\n================================================');
  console.log('📊 RÉSUMÉ FINAL :');
  console.log(`   ✅ Générées  : ${stats.traites}`);
  console.log(`   ⏭️  Skippées  : ${already}`);
  console.log(`   ❌ Erreurs   : ${stats.erreurs}`);

  if (errors.length > 0) {
    console.log('\n❌ Produits en erreur :');
    errors.forEach(e => console.log(`   - ${e.nom}: ${e.erreur}`));
  }

  console.log('\n✨ TERMINÉ — Images disponibles sur le site\n');
}

main().catch(err => {
  console.error('❌ Erreur critique:', err);
  process.exit(1);
});
