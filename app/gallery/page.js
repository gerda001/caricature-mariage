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

      {/* Configuration stricte pour le format Canon SELPHY 10cm x 14.8cm */}
      <style jsx global>{`
        @media print {
          /* On force la taille du papier au format carte postale Canon (Portrait) */
          @page {
            size: 10cm 14.8cm;
            margin: 0mm !important;
          }
          
          html, body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 10cm !important;
            height: 14.8cm !important;
          }

          /* Masquage des éléments inutiles */
          .no-print, 
          .gallery-item.not-selected {
            display: none !important;
          }

          .gallery-grid {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Conteneur calé au millimètre près */
          .gallery-item.selected {
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 10cm !important;
            height: 14.8cm !important;
            display: flex !important;
            justifyContent: center;
            alignItems: center;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Gestion des sauts de page inter-photos */
          .gallery-item.selected:not(:last-child) {
            page-break-after: always !important;
            break-after: page !important;
          }

          /* L'image s'adapte au format carte postale sans baver sur les côtés */
          .gallery-item.selected img {
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            margin: 0 !important;
            object-fit: contain !important; /* Ajuste l'image pour qu'elle tienne parfaitement dans les 10x14.8cm */
          }
        }
      `}</style>
    </main>
  );
}
