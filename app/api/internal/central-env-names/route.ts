import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const names = Object.keys(process.env)
    .filter((name) => /SUPABASE|R2|CLOUDFLARE|S3|AWS/i.test(name))
    .sort();

  return NextResponse.json({ names });
}
