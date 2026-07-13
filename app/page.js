'use client';

import { useState, useRef } from 'react';

const COUPLE_NAMES = 'Johan & Liz'; // <-- Changez ce nom
const WEDDING_DATE = '18 Juin 2026'; // <-- Changez cette date

export default function Home() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [resultUrl, setResultUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResultUrl(null);
    setStatus('idle');
  }

  async function handleGenerate() {
    if (!file) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await fetch('/api/caricature', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Une erreur est survenue.');
        setStatus('error');
        return;
      }
      setResultUrl(data.url);
      setStatus('done');
    } catch (err) {
      setErrorMsg('Impossible de contacter le serveur.');
      setStatus('error');
    }
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setStatus('idle');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '32px 20px 60px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <a
        href="/gallery"
        title="Voir la galerie"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#fffdfb',
          border: '1px solid #d8c9b0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          textDecoration: 'none',
        }}
      >
        🖼️
      </a>

      <p style={{ letterSpacing: 3, textTransform: 'uppercase', fontSize: 12, color: '#a98f6b' }}>
        {WEDDING_DATE}
      </p>
      <h1 style={{ fontSize: 28, margin: '4px 0 6px', fontWeight: 400 }}>
        {COUPLE_NAMES}
      </h1>
      <p style={{ color: '#6b625c', fontSize: 15, marginBottom: 28 }}>
        Prenez une photo et repartez avec votre portrait aquarelle souvenir ✨
      </p>

      {!preview && (
        <label
          htmlFor="photo-input"
          style={{
            display: 'block',
            border: '2px dashed #d8c9b0',
            borderRadius: 16,
            padding: '48px 20px',
            cursor: 'pointer',
            background: '#fffdfb',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
          <div style={{ fontWeight: 600 }}>Prendre / choisir une photo</div>
          <div style={{ fontSize: 13, color: '#8a8078', marginTop: 4 }}>
            Une ou plusieurs personnes, bien visibles
          </div>
        </label>
      )}
      <input
        id="photo-input"
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {preview && (
        <div>
          <img
            src={preview}
            alt="Aperçu"
            style={{
              width: '100%',
              borderRadius: 16,
              marginBottom: 16,
              maxHeight: 420,
              objectFit: 'cover',
            }}
          />

          {status !== 'done' && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={secondaryBtn}
                disabled={status === 'loading'}
              >
                Reprendre
              </button>
              <button
                onClick={handleGenerate}
                style={primaryBtn}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Création en cours…' : 'Créer ma caricature'}
              </button>
            </div>
          )}

          {status === 'loading' && (
            <p style={{ marginTop: 16, color: '#8a8078', fontSize: 14 }}>
              La magie opère, ça peut prendre 15 à 30 secondes… 🎨
            </p>
          )}

          {status === 'error' && (
            <p style={{ marginTop: 16, color: '#b3413a', fontSize: 14 }}>{errorMsg}</p>
          )}
        </div>
      )}

      {status === 'done' && resultUrl && (
        <div style={{ marginTop: 24 }}>
          <img
            src={resultUrl}
            alt="Votre caricature"
            style={{ width: '100%', borderRadius: 16, marginBottom: 16 }}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={resultUrl} download style={primaryBtn}>
              Télécharger
            </a>
            <button onClick={reset} style={secondaryBtn}>
              Refaire une photo
            </button>
          </div>
          <p style={{ marginTop: 20 }}>
            <a href="/gallery" style={{ color: '#a98f6b' }}>
              Voir la galerie de tous les invités →
            </a>
          </p>
        </div>
      )}
    </main>
  );
}

const primaryBtn = {
  background: '#3a3532',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '12px 22px',
  fontSize: 15,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
};

const secondaryBtn = {
  background: 'transparent',
  color: '#3a3532',
  border: '1px solid #d8c9b0',
  borderRadius: 999,
  padding: '12px 22px',
  fontSize: 15,
  cursor: 'pointer',
};
