export function mediaUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_R2_BASE_URL || 'https://pub-a13328795bd948f88f03c7671a60d6c7.r2.dev';
  // Ensure we don't end up with double slashes between base and path
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  return `${normalizedBase}/${normalizedPath}`;
}
