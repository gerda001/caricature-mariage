'use client';

import { useEffect, useState } from 'react';

export default function Gallery() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  // Stocke les URLs des photos cochées pour l'impression
  const [selectedUrls, setSelectedUrls] = useState([]);

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => {
        setUrls(data.urls || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Activer ou désactiver la sélection d'une photo au clic
  const toggleSelect = (url) => {
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((item) => item !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>
      
      {/* Cet en-tête complet sera automatiquement masqué lors de l'impression grâce à la classe .no-print */}
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
          {urls.length} caricature{urls.length > 1 ? 's' : ''} créée{urls.length > 1 ? 's' : ''} jusqu'à présent
        </p>

        {/* Le bouton d'impression apparaît uniquement si au moins une image est cochée */}
        {selectedUrls.length > 0 && (
          <button
            onClick={() => window.print()}
            style={{
              marginTop: 12,
              background: '#3a3532',
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🖨️ Imprimer la sélection ({selectedUrls.length})
          </button>
        )}
      </div>

      {loading && <p style={{ textAlign: 'center' }} className="no-print">Chargement…</p>}
      {!loading && urls.length === 0 && (
        <p style={{ textAlign: 'center', color: '#8a8078' }} className="no-print">
          Aucune caricature pour le moment. Soyez le premier !
        </p>
      )}

      {/* Grille contenant toutes les images */}
      <div
        className="gallery-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {urls.map((url) => {
          const isSelected = selectedUrls.includes(url);
          return (
            <div
              key={url}
              onClick={() => toggleSelect(url)}
              className={`gallery-item ${isSelected ? 'selected' : 'not-selected'}`}
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: 12,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                border: isSelected ? '4px solid #a98f6b' : '4px solid transparent',
              }}
            >
              <img
                src={url}
                alt="Caricature invité"
                style={{
                  width: '100%',
                  display: 'block',
                }}
              />
              {/* Petite bulle avec une coche sur les photos sélectionnées */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: '#a98f6b',
                  color: '#fff',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Styles globaux gérant l'affichage écran et la mise en page d'impression papier */}
      <style jsx global>{`
        @media print {
          /* 1. On cache tout ce qui ne doit pas être imprimé */
          .no-print, 
          .gallery-item.not-selected {
            display: none !important;
          }
          
          body, main {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 2. On casse la grille pour forcer la mise en page séquentielle */
          .gallery-grid {
            display: block !important;
          }

          /* 3. Configuration de chaque photo sélectionnée pour l'imprimante photo */
          .gallery-item.selected {
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            page-break-after: always; /* Force un saut de page après chaque image pour la SELPHY */
            break-after: page;
          }

          .gallery-item.selected img {
            width: 100% !important;
            max-height: 100vh;
            object-fit: contain;
          }
        }
      `}</style>
    </main>
  );
}
