import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()

const jobs = [
  {
    source: 'assets-source/characters/joziel/night-strategy.png',
    target: 'public/assets/characters/joziel/cards/night-strategy.webp',
    width: 1080,
    quality: 82,
  },
]

for (const job of jobs) {
  const source = path.join(root, job.source)
  const target = path.join(root, job.target)
  const temporary = `${target}.tmp`

  await fs.mkdir(path.dirname(target), { recursive: true })

  try {
    await fs.access(source)
  } catch {
    throw new Error(`Missing source asset: ${job.source}`)
  }

  await sharp(source)
    .rotate()
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality, effort: 5 })
    .toFile(temporary)

  await fs.rename(temporary, target)

  const [before, after] = await Promise.all([fs.stat(source), fs.stat(target)])
  const saved = Math.max(0, 1 - after.size / before.size)
  console.log(
    `[assets] ${job.target}: ${(before.size / 1024).toFixed(0)} KB -> ${(after.size / 1024).toFixed(0)} KB (${(saved * 100).toFixed(0)}% smaller)`,
  )
}
