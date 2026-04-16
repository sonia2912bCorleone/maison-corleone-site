const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const svgPath = path.join(__dirname, '../public/icon.svg')
const publicDir = path.join(__dirname, '../public')

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath)

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'))
  console.log('✅ icon-192.png')

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'))
  console.log('✅ icon-512.png')

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'))
  console.log('✅ apple-touch-icon.png')

  console.log('Icons generated in public/')
}

generateIcons().catch(console.error)
