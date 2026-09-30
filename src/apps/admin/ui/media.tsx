import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, FileText, ImageOff } from 'lucide-react';

/**
 * Versiones del admin de PhotoCarousel y DocumentViewer (shared/components).
 * Mismas props, pero con el sistema de diseño del panel: sin emojis y sin
 * utilidades de Tailwind que el reset global anula. Las del portal de
 * partners no se tocan.
 */

export interface GalleryPhoto {
  url: string;
  thumbnailUrl?: string | null;
  fileName?: string;
}

export const PhotoGallery: React.FC<{ photos: GalleryPhoto[] }> = ({ photos }) => {
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="adm-media-empty">
        <ImageOff aria-hidden="true" />
        <span>Sin fotos</span>
      </div>
    );
  }

  const i = Math.min(index, photos.length - 1);
  const current = photos[i];
  const go = (n: number) => setIndex(Math.max(0, Math.min(n, photos.length - 1)));

  return (
    <div className="adm-gallery">
      <div className="adm-gallery__stage">
        <a href={current.url} target="_blank" rel="noopener noreferrer" title="Abrir en una pestaña nueva">
          <img src={current.url} alt={current.fileName || `Foto ${i + 1} de ${photos.length}`} />
        </a>
        {photos.length > 1 && (
          <>
            <button type="button" className="adm-gallery__nav adm-gallery__nav--prev" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Foto anterior">
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" className="adm-gallery__nav adm-gallery__nav--next" onClick={() => go(i + 1)} disabled={i === photos.length - 1} aria-label="Foto siguiente">
              <ChevronRight aria-hidden="true" />
            </button>
          </>
        )}
        <span className="adm-gallery__count">{i + 1} de {photos.length}</span>
      </div>
      {photos.length > 1 && (
        <div className="adm-gallery__thumbs">
          {photos.map((p, n) => (
            <button
              key={n}
              type="button"
              className={`adm-gallery__thumb${n === i ? ' adm-gallery__thumb--on' : ''}`}
              onClick={() => go(n)}
              aria-label={`Ver foto ${n + 1}`}
              aria-current={n === i ? 'true' : undefined}
            >
              <img src={p.thumbnailUrl || p.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface ListedDocument {
  fileName: string;
  fileType: string;
  signedUrl?: string | null;
  storageUrl: string;
  mimeType?: string;
}

const DOC_LABELS: Record<string, string> = {
  technical_doc: 'Documento técnico',
  operational_doc: 'Documento operativo',
};

export const DocumentList: React.FC<{ documents: ListedDocument[] }> = ({ documents }) => {
  if (documents.length === 0) {
    return (
      <div className="adm-media-empty">
        <FileText aria-hidden="true" />
        <span>Sin documentos</span>
      </div>
    );
  }

  return (
    <ul className="adm-doclist">
      {documents.map((doc, n) => (
        <li key={n}>
          <a href={doc.signedUrl || doc.storageUrl} target="_blank" rel="noopener noreferrer" className="adm-doclist__item">
            <FileText aria-hidden="true" />
            <span className="adm-doclist__text">
              <span className="adm-doclist__name">{doc.fileName}</span>
              <span className="adm-doclist__type">{DOC_LABELS[doc.fileType] ?? 'Documento'}</span>
            </span>
            <ExternalLink aria-hidden="true" className="adm-doclist__open" />
          </a>
        </li>
      ))}
    </ul>
  );
};
