import React from 'react';

interface DocumentViewerProps {
  documents: Array<{
    fileName: string;
    fileType: string;
    signedUrl?: string | null;
    storageUrl: string;
    mimeType?: string;
  }>;
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents, className = '' }) => {
  const openDocument = (doc: DocumentViewerProps['documents'][0]) => {
    const url = doc.signedUrl || doc.storageUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getDocIcon = (fileType: string, mimeType?: string) => {
    if (mimeType?.includes('pdf') || fileType.includes('doc')) return '📄';
    if (fileType === 'technical_doc') return '🔬';
    if (fileType === 'operational_doc') return '📋';
    return '📎';
  };

  const getDocLabel = (fileType: string) => {
    switch (fileType) {
      case 'technical_doc': return 'Documento Técnico';
      case 'operational_doc': return 'Documento Operativo';
      default: return 'Documento';
    }
  };

  if (documents.length === 0) {
    return (
      <div className={`flex items-center justify-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm">Sin documentos adjuntos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {documents.map((doc, index) => (
        <button
          key={index}
          onClick={() => openDocument(doc)}
          className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group text-left"
        >
          <span className="text-2xl">{getDocIcon(doc.fileType, doc.mimeType)}</span>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate group-hover:text-emerald-700">
              {doc.fileName}
            </p>
            <p className="text-xs text-gray-400">{getDocLabel(doc.fileType)}</p>
          </div>

          <span className="text-gray-300 group-hover:text-emerald-500 transition-colors">
            ↗️
          </span>
        </button>
      ))}
    </div>
  );
};

export default DocumentViewer;
