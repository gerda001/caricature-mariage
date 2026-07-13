import { list } from '@vercel/blob';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'caricatures/' });
    const urls = blobs
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .map((b) => b.url);
    return Response.json({ urls });
  } catch (err) {
    console.error('Erreur galerie:', err);
    return Response.json({ urls: [] });
  }
}
