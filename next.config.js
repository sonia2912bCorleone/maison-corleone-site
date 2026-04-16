/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — source vérité permanente
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Airtable — wildcard couvre v3/v4/v5/attachments/etc.
      { protocol: 'https', hostname: '*.airtableusercontent.com' },
      { protocol: 'https', hostname: 'dl.airtable.com' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
}

module.exports = nextConfig
