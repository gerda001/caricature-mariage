# 💍 Caricature de Mariage — Guide de déploiement

Cet outil permet à vos invités de scanner un QR code, prendre une photo depuis
leur téléphone, et recevoir instantanément une caricature aquarelle (dans le
style de vos illustrations "Galentine's"). Toutes les caricatures s'accumulent
aussi dans une galerie partagée, imprimable après le mariage.

Aucune compétence en code n'est nécessaire pour le déployer — suivez juste les
étapes ci-dessous. Comptez environ **15 à 20 minutes** la première fois.

---

## Étape 1 — Créer votre clé Google Gemini (2 min)

1. Allez sur https://aistudio.google.com/apikey
2. Connectez-vous avec un compte Google.
3. Cliquez sur **"Create API key"**.
4. Copiez la clé générée (une longue chaîne de caractères) — vous en aurez
   besoin à l'étape 4.

**Coût** : environ 0,02 à 0,04 € par caricature générée. Pour 100 invités,
comptez quelques euros au total. Vous ne payez que ce que vous consommez.

---

## Étape 2 — Créer un compte Vercel (2 min)

1. Allez sur https://vercel.com/signup
2. Inscrivez-vous (le plus simple : avec votre compte GitHub — créez-en un
   gratuitement sur https://github.com/signup si vous n'en avez pas).

Vercel hébergera votre site gratuitement (le plan gratuit suffit largement
pour un mariage).

---

## Étape 3 — Mettre le projet en ligne sur GitHub (3 min)

1. Allez sur https://github.com/new
2. Donnez un nom au dépôt, par exemple `caricature-mariage`.
3. Laissez-le en **Public** ou **Private**, peu importe.
4. Cliquez sur **Create repository**.
5. Sur la page qui suit, cliquez sur **"uploading an existing file"**.
6. Glissez-déposez **tout le contenu du dossier** `mariage-caricature` que je
   vous ai fourni (tous les fichiers et dossiers, pas le dossier lui-même).
7. Cliquez sur **Commit changes** en bas de page.

---

## Étape 4 — Déployer sur Vercel (3 min)

1. Sur https://vercel.com, cliquez sur **"Add New" → "Project"**.
2. Choisissez le dépôt GitHub `caricature-mariage` que vous venez de créer.
3. Cliquez sur **Import**.
4. Avant de cliquer sur Deploy, dépliez **"Environment Variables"** et ajoutez :
   - **Name** : `GEMINI_API_KEY`
   - **Value** : la clé copiée à l'étape 1
5. Cliquez sur **Deploy**. Après 1-2 minutes, votre site est en ligne 🎉

---

## Étape 5 — Activer le stockage des images (2 min)

Pour que la galerie fonctionne (sauvegarde des caricatures) :

1. Dans votre projet sur Vercel, allez dans l'onglet **Storage**.
2. Cliquez sur **Create Database** → choisissez **Blob**.
3. Donnez-lui un nom (ex : `caricatures`) et cliquez sur **Create**.
4. Vercel connecte automatiquement le token nécessaire à votre projet —
   rien d'autre à faire.
5. Retournez dans l'onglet **Deployments**, cliquez sur les **"..."** du
   dernier déploiement → **Redeploy** (pour que la variable soit bien prise
   en compte).

---

## Étape 6 — Personnaliser les noms et la date

1. Dans GitHub, ouvrez le fichier `app/page.js`.
2. Cliquez sur l'icône crayon (✏️) pour éditer.
3. Modifiez ces deux lignes tout en haut :
   ```js
   const COUPLE_NAMES = 'Johan & Liz';
   const WEDDING_DATE = '18 Juin 2026';
   ```
4. Cliquez sur **Commit changes**. Vercel redéploiera automatiquement en
   1 minute.

---

## Étape 7 — Générer votre QR code

1. Une fois déployé, Vercel vous donne une URL du type
   `https://caricature-mariage.vercel.app`.
2. Allez sur https://www.qr-code-generator.com/ (ou tout générateur de QR
   code gratuit), collez cette URL, téléchargez le QR code en image.
3. Imprimez-le sur vos tables, votre panneau d'accueil, ou vos cartons de
   remerciement.

Le lien `https://caricature-mariage.vercel.app/gallery` donne accès à la
galerie complète (pratique pour vous, après le mariage, pour tout
télécharger et imprimer un album).

---

## Tester avant le jour J

Ouvrez votre URL Vercel depuis votre téléphone, prenez une photo de vous et
d'un proche, et vérifiez que la caricature vous plaît. Vous pouvez ajuster le
style en modifiant le texte `STYLE_PROMPT` dans le fichier
`app/api/caricature/route.js` si vous voulez plus ou moins d'aquarelle, plus
de couleurs, etc.

## Si le modèle Gemini est renommé par Google

Google fait parfois évoluer le nom de ses modèles. Si vous obtenez une erreur
de génération, vérifiez le nom du modèle actuel sur
https://ai.google.dev/gemini-api/docs/image-generation et remplacez la valeur
`MODEL` dans `app/api/caricature/route.js`.

## Besoin d'aide ?

Si une étape bloque, revenez me voir avec le message d'erreur exact (capture
d'écran si possible) et je vous aiderai à le résoudre.
