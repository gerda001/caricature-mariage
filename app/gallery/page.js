'use client';

import { useEffect, useState } from 'react';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

async function downloadBlobAs(blob, filename) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export default function Gallery() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => {
        setUrls(data.urls || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleSelect(url) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  }

  function toggleSelectMode() {
    setSelectMode((v) => !v);
    setSelected(new Set());
  }

  function printAll() {
    document.body.classList.remove('printing-selection');
    window.print();
  }

  function printSelection() {
    if (selected.size === 0) return;
    document.body.classList.add('printing-selection');
    window.print();
  }

  useEffect(() => {
    function cleanup() {
      document.body.classList.remove('printing-selection');
    }
    window.addEventListener('afterprint', cleanup);
    return () => window.removeEventListener('afterprint', cleanup);
  }, []);

  async function downloadOne(url, index, e) {
    e.stopPropagation();
    const res = await fetch(url);
    const blob = await res.blob();
    await downloadBlobAs(blob, `caricature-${index + 1}.png`);
  }

  async function downloadSelection() {
    if (selected.size === 0) return;
    setDownloading(true);
    try {
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
      );
      const zip = new window.JSZip();
      let i = 0;
      for (const url of selected) {
        i++;
        const res = await fetch(url);
        const blob = await res.blob();
        zip.file(`caricature-${i}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      await downloadBlobAs(content, 'caricatures-mariage.zip');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
      <div
        className="no-print"
        style={{ textAlign: 'center', marginBottom: 24, position: 'relative' }}
      >
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
        <p style={{ color: '#a98f6b', fontSize: 12 }}>
          Astuce iPhone : appuyez longuement sur une photo pour l'enregistrer
          directement dans Photos
        </p>

        <div
          style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: 12,
          }}
        >
          <button onClick={toggleSelectMode} style={btnStyle(selectMode)}>
            {selectMode ? '✕ Annuler la sélection' : '☑️ Sélectionner des photos'}
          </button>

          {!selectMode && (
            <button onClick={printAll} style={btnStyle(false)}>
              🖨️ Imprimer toute la galerie
            </button>
          )}

          {selectMode && (
            <>
              <button
                onClick={printSelection}
                disabled={selected.size === 0}
                style={disabledableBtn(selected.size === 0)}
              >
                🖨️ Imprimer la sélection ({selected.size})
              </button>
              <button
                onClick={downloadSelection}
                disabled={selected.size === 0 || downloading}
                style={disabledableBtn(selected.size === 0 || downloading)}
              >
                {downloading
                  ? '⏳ Préparation…'
                  : `⬇️ Télécharger la sélection (${selected.size})`}
              </button>
            </>
          )}
        </div>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {urls.map((url, index) => {
          const isSelected = selected.has(url);
          return (
            <div
              key={url}
              className={`gallery-item${isSelected ? ' selected' : ''}`}
              onClick={() => selectMode && toggleSelect(url)}
              style={{
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: selectMode ? 'pointer' : 'default',
                outline: isSelected ? '3px solid #a98f6b' : 'none',
                outlineOffset: 2,
              }}
            >
              {selectMode && (
                <div
                  className="no-print"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: isSelected ? '#a98f6b' : 'rgba(255,255,255,0.85)',
                    border: '1px solid #d8c9b0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: '#fff',
                    zIndex: 2,
                  }}
                >
                  {isSelected ? '✓' : ''}
                </div>
              )}

              <button
                className="no-print"
                onClick={(e) => downloadOne(url, index, e)}
                title="Télécharger cette photo"
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid #d8c9b0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                ⬇️
              </button>

              <img
                src={url}
                alt="Caricature invité"
                style={{
                  width: '100%',
                  display: 'block',
                  breakInside: 'avoid',
                }}
              />
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          body.printing-selection .gallery-item:not(.selected) {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function btnStyle(active) {
  return {
    background: active ? '#3a3532' : '#fffdfb',
    color: active ? '#fff' : '#3a3532',
    border: '1px solid #d8c9b0',
    borderRadius: 999,
    padding: '10px 18px',
    fontSize: 14,
    cursor: 'pointer',
  };
}

function disabledableBtn(isDisabled) {
  return {
    ...btnStyle(false),
    opacity: isDisabled ? 0.4 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
  };
}
