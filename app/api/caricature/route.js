import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Chaque clé correspond à un style proposé aux invités sur la page d'accueil.
// Pour changer un texte de style, modifiez juste la valeur ci-dessous.
const STYLE_PROMPTS = {
  watercolor: `Reimagine the people in this photo as a loose, hand-painted watercolor
illustration, in the style of a modern wedding stationery artist. This must NOT look
like a filtered photo — it must look like an artist looked at the photo once and then
painted their impression of it from memory.

Style rules:
- Simplify facial features into soft, minimal shapes: small dot or short-line eyes,
  a light suggestion of a nose, a simple curved mouth. Do not render realistic eyes,
  pores, wrinkles, or photographic skin texture.
- Use loose, imprecise, imperfect brush strokes with visible watercolor bleed and
  paper texture. Edges should be soft and slightly uneven, never crisp or vector-like.
- Slightly exaggerate proportions in a charming way (slightly bigger head-to-body
  ratio, simplified hands), like an editorial fashion illustration, not a portrait.
- Flatten and simplify clothing into a few solid color shapes rather than folds and
  realistic fabric detail.
- Warm pastel palette (blush pink, soft gold, sage green, dusty blue), plain soft
  off-white background, no hard shadows.
- Keep only the general hair color, skin tone, and outfit colors recognizable — the
  goal is an artistic impression of the people, not a likeness-accurate rendering.

Portrait format matching a 10x15cm postcard print (aspect ratio 2:3), print-ready,
high resolution.`,

  ink_sketch: `Reimagine the people in this photo as a romantic hand-drawn ink sketch,
in the style of a whimsical wedding save-the-date illustration: simple round heads,
minimal dot eyes, a small curved smile, loose black ink outlines only (no shading, no
color fill except a few small red heart doodles scattered around the drawing). Keep
proportions simplified and slightly childlike/charming, not realistic. Plain white
background. This must look like a quick, sweet pen doodle, not a detailed portrait.
Portrait format matching a 10x15cm postcard print (aspect ratio 2:3), print-ready,
high resolution.`,

  comic_color: `Reimagine the people in this photo as a bold modern comic-book style
caricature portrait: thick clean black outlines, flat cel-shaded coloring with 2-3
tones per area, slightly exaggerated and friendly facial expressions, vibrant saturated
colors. Simplify clothing into flat color shapes. Plain solid color background. Keep
only the general hair color, skin tone and outfit colors recognizable. This should look
like a fun modern caricature illustration, not a photo. Portrait format matching a
10x15cm postcard print (aspect ratio 2:3), print-ready, high resolution.`,

  vintage: `Reimagine the people in this photo as a vintage retro illustration from the
1970s, in the style of an old faded postcard: muted desaturated colors (warm mustard,
faded orange, olive green, dusty brown), soft grainy texture, simplified painterly
shapes rather than photographic detail, slightly nostalgic and hazy feeling. Simplify
facial features softly, do not render photographic skin texture. Plain warm-toned
background. Portrait format matching a 10x15cm postcard print (aspect ratio 2:3),
print-ready, high resolution.`,

  line_art: `Reimagine the people in this photo as a minimalist continuous single-line
drawing: one uninterrupted thin black line forming the silhouette and key features of
the people, no shading, no color fill (except perhaps one small solid color accent
shape like a heart or flower), lots of plain white negative space. Elegant, refined,
very simplified — abstract impression rather than a detailed likeness. Portrait format
matching a 10x15cm postcard print (aspect ratio 2:3), print-ready, high resolution.`,

  pop_art: `Reimagine the people in this photo as a bold pop-art portrait in the style
of 1960s screen-print art: thick black outlines, flat halftone-dot shading, highly
saturated contrasting colors (hot pink, bright yellow, electric blue, red), dramatic
graphic simplification of facial features, plain bold solid-color background. This
should look like a stylized pop-art poster, not a photo. Portrait format matching a
10x15cm postcard print (aspect ratio 2:3), print-ready, high resolution.`,
};

const DEFAULT_STYLE = 'watercolor';

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

    const requestedStyle = formData.get('style');
    const stylePrompt =
      STYLE_PROMPTS[requestedStyle] || STYLE_PROMPTS[DEFAULT_STYLE];

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
                { text: stylePrompt },
                { inline_data: { mime_type: mimeType, data: base64Image } },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: {
              aspectRatio: '2:3',
            },
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
