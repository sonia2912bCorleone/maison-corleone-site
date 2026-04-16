export type Lang = 'fr' | 'en'

export const translations = {
  fr: {
    // Nav
    nav_catalogue: 'Catalogue',
    nav_contact: 'Contact',
    nav_espace_client: 'Espace Client',
    nav_accueil: 'Accueil',

    // Hero
    hero_tagline: "Sourcing Mondial d'exception",
    hero_tagline2: 'Accès direct aux Usines',
    hero_tagline3: 'Haut de Gamme jusqu\'à −87% sous le prix Public',
    hero_subtitle: 'Mobilier haut de gamme sourcing direct ateliers de référence. Qualité B&B Italia, jusqu\'à −87% sous le prix public.',
    hero_cta: 'Découvrir le catalogue',
    hero_cta2: 'Demander un accès',

    // Catalogue
    catalogue_title: 'Notre Catalogue',
    catalogue_subtitle: 'Accès direct aux ateliers de référence.',
    catalogue_all: 'Tout',
    catalogue_no_products: 'Aucun produit dans cette catégorie.',
    catalogue_loading: 'Chargement du catalogue…',

    // Product
    product_ref: 'Référence',
    product_price: 'Prix public HT',
    product_price_unit: '€ HT',
    product_devis: 'Demander un devis',
    product_back: '← Retour au catalogue',
    product_details: 'Détails du produit',
    product_category: 'Catégorie',

    // Devis form
    devis_title: 'Demander un devis',
    devis_name: 'Nom / Société',
    devis_email: 'Email professionnel',
    devis_phone: 'Téléphone',
    devis_qty: 'Quantité souhaitée',
    devis_message: 'Message (projet, délai…)',
    devis_send: 'Envoyer la demande',
    devis_sending: 'Envoi en cours…',
    devis_success: 'Demande envoyée ! Nous vous répondons sous 24h.',
    devis_error: 'Erreur lors de l\'envoi. Contactez-nous à contact@maisoncorleone.com',

    // Password
    password_title: 'Accès réservé',
    password_subtitle: 'Catalogue professionnel Maison Corleone',
    password_label: 'Mot de passe',
    password_submit: 'Accéder',
    password_error: 'Mot de passe incorrect.',
    password_placeholder: 'Entrez le mot de passe',

    // Espace client
    client_title: 'Espace Client',
    client_subtitle: 'Accédez à votre catalogue personnalisé',
    client_code_label: 'Votre code client',
    client_code_placeholder: 'HTL-PARIS-001',
    client_submit: 'Accéder à mon espace',
    client_error: 'Code client invalide.',

    // Footer
    footer_address: '177 Av. Georges Clémenceau, 92000 Nanterre',
    footer_rcs: 'RCS Nanterre 987 948 155',
    footer_rights: 'Tous droits réservés',
    footer_contact: 'Contact',
  },
  en: {
    // Nav
    nav_catalogue: 'Catalogue',
    nav_contact: 'Contact',
    nav_espace_client: 'Client Area',
    nav_accueil: 'Home',

    // Hero
    hero_tagline: 'Exceptional Global Sourcing',
    hero_tagline2: 'Direct Factory Access',
    hero_tagline3: 'Premium Furniture up to −87% below Retail',
    hero_subtitle: 'Premium furniture sourced directly from reference workshops. B&B Italia quality, up to −87% below retail price.',
    hero_cta: 'Explore the catalogue',
    hero_cta2: 'Request access',

    // Catalogue
    catalogue_title: 'Our Catalogue',
    catalogue_subtitle: 'Direct access to reference workshops.',
    catalogue_all: 'All',
    catalogue_no_products: 'No products in this category.',
    catalogue_loading: 'Loading catalogue…',

    // Product
    product_ref: 'Reference',
    product_price: 'Retail price HT',
    product_price_unit: '€ HT',
    product_devis: 'Request a quote',
    product_back: '← Back to catalogue',
    product_details: 'Product details',
    product_category: 'Category',

    // Devis form
    devis_title: 'Request a quote',
    devis_name: 'Name / Company',
    devis_email: 'Professional email',
    devis_phone: 'Phone',
    devis_qty: 'Desired quantity',
    devis_message: 'Message (project, timeline…)',
    devis_send: 'Send request',
    devis_sending: 'Sending…',
    devis_success: 'Request sent! We will reply within 24h.',
    devis_error: 'Error sending. Contact us at contact@maisoncorleone.com',

    // Password
    password_title: 'Restricted access',
    password_subtitle: 'Maison Corleone professional catalogue',
    password_label: 'Password',
    password_submit: 'Enter',
    password_error: 'Incorrect password.',
    password_placeholder: 'Enter password',

    // Espace client
    client_title: 'Client Area',
    client_subtitle: 'Access your personalised catalogue',
    client_code_label: 'Your client code',
    client_code_placeholder: 'HTL-PARIS-001',
    client_submit: 'Access my space',
    client_error: 'Invalid client code.',

    // Footer
    footer_address: '177 Av. Georges Clémenceau, 92000 Nanterre, France',
    footer_rcs: 'RCS Nanterre 987 948 155',
    footer_rights: 'All rights reserved',
    footer_contact: 'Contact',
  },
} as const

export type TranslationKey = keyof typeof translations.fr

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? translations.fr[key] ?? key
}
