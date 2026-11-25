// Reads intrinsic image sizes at build time so every <img> gets width and height.
import path from 'node:path';
import sharp from 'sharp';

const cache = new Map<string, { width: number; height: number }>();

export async function size(src: string) {
  if (cache.has(src)) return cache.get(src)!;
  const meta = await sharp(path.resolve('public' + src)).metadata();
  const s = { width: meta.width ?? 1200, height: meta.height ?? 800 };
  cache.set(src, s);
  return s;
}
