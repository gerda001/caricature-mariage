'use client';

import { useEffect, useState } from 'react';

export default function Gallery() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => {
        setUrls(data.urls || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div className="no-print" style={{ textAlign: 'center', marginBottom: 24, position: 'relative' }}>
        <a
          href="/"
          title="Retour"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
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
          📷
        </a>
        <h1 style={{ fontWeight: 400 }}>Galerie des invités</h1>
        <p style={{ color: '#8a8078', fontSize: 14 }}>
          {urls.length} caricature{urls.length > 1 ? 's' : ''} créée
          {urls.length > 1 ? 's' : ''} jusqu'à présent
        </p>
        <button
          onClick={() => window.print()}
          style={{
            marginTop: 8,
            background: '#3a3532',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          🖨️ Imprimer la galerie
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Chargement…</p>}
      {!loading && urls.length === 0 && (
        <p style={{ textAlign: 'center', color: '#8a8078' }}>
          Aucune caricature pour le moment. Soyez le premier !
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {urls.map((url) => (
          <img
            key={url}
            src={url}
            alt="Caricature invité"
            style={{
              width: '100%',
              borderRadius: 12,
              breakInside: 'avoid',
              display: 'block',
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @media print {
          .no-print button {
            display: none;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </main>
  );
}
