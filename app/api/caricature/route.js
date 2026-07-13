import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Le prompt qui définit le style : aquarelle douce, comme les illustrations
// "Galentine's" et "boule à facettes" fournies par les mariés.
const STYLE_PROMPT = `Transform the people in this photo into an elegant watercolor
illustration, in the style of a modern wedding stationery artist: soft, translucent
watercolor washes, delicate thin ink or fine-line outlines, loose and painterly
brushstrokes, a warm pastel color palette (blush pink, soft gold, sage green, dusty blue).
Keep clothing colors, hair color and general likeness close to the original photo, but
render everything in this hand-painted watercolor style, not a cartoon or comic style,
not a bold-outline sketch. Use a plain soft off-white background with no hard edges.
The final image should look like a page from a romantic wedding illustration book,
square format, print-ready, high resolution.`;

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Clé GEMINI_API_KEY manquante côté serveur." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('photo');
    if (!file) {
      return Response.json({ error: "Aucune photo reçue." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'image/jpeg';

    // Appel à l'API Gemini (modèle Nano Banana / gemini-2.5-flash-image)
    // Si Google renomme le modèle, changez juste la valeur ci-dessous.
    const MODEL = 'gemini-2.5-flash-image';
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: STYLE_PROMPT },
                { inline_data: { mime_type: mimeType, data: base64Image } },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE'],
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Erreur Gemini:', errText);
      return Response.json(
        { error: "Erreur lors de la génération de l'image. Réessayez." },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData || p.inline_data);
    const inline = imagePart?.inlineData || imagePart?.inline_data;

    if (!inline?.data) {
      return Response.json(
        { error: "Le modèle n'a pas renvoyé d'image. Réessayez avec une autre photo." },
        { status: 502 }
      );
    }

    const outputBuffer = Buffer.from(inline.data, 'base64');
    const filename = `caricatures/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.png`;

    // Sauvegarde dans Vercel Blob pour la galerie partagée
    const blob = await put(filename, outputBuffer, {
      access: 'public',
      contentType: inline.mimeType || 'image/png',
    });

    return Response.json({ url: blob.url });
  } catch (err) {
    console.error('Erreur route caricature:', err);
    return Response.json(
      { error: "Une erreur inattendue est survenue." },
      { status: 500 }
    );
  }
}
