// Generates public/og.jpg (1200×630 Open Graph image) from the hero. Run: npm run og
import sharp from 'sharp';
await sharp('public/assets/img/hero-crt.jpg').resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og.jpg');
console.log('wrote public/og.jpg');
