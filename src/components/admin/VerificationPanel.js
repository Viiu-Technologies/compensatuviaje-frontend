import React, { useState, useEffect } from 'react';
import './VerificationPanel.css';

const VerificationPanel = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Cargar empresas (mock data por ahora)
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = () => {
    setLoading(true);
    
    // Mock data - esto vendrá del backend
    const mockCompanies = [
      {
        id: 1,
        companyName: 'Tech Solutions SpA',
        rut: '76.123.456-7',
        email: 'contacto@techsolutions.cl',
        submittedDate: '2025-10-20',
        status: 'pending',
        documents: [
          { name: 'estatutos.pdf', type: 'estatutos', uploaded: true, verified: false },
          { name: 'poder_representante.pdf', type: 'poder', uploaded: true, verified: false },
          { name: 'certificado_vigencia.pdf', type: 'vigencia', uploaded: true, verified: false }
        ],
        contactInfo: {
          legalRep: 'Juan Pérez',
          phone: '+56 9 1234 5678',
          region: 'Región Metropolitana',
          city: 'Santiago',
          address: 'Av. Providencia 1234, Of 567'
        },
        operationalInfo: {
          industry: 'Tecnología',
          employees: '51-200',
          revenue: '$200M - $1.000M'
        }
      },
      {
        id: 2,
        companyName: 'Green Energy Chile SA',
        rut: '78.987.654-3',
        email: 'info@greenenergy.cl',
        submittedDate: '2025-10-18',
        status: 'pending',
        documents: [
          { name: 'estatutos_green.pdf', type: 'estatutos', uploaded: true, verified: false },
          { name: 'poder_legal.pdf', type: 'poder', uploaded: true, verified: false },
          { name: 'vigencia_sii.pdf', type: 'vigencia', uploaded: true, verified: false }
        ],
        contactInfo: {
          legalRep: 'María González',
          phone: '+56 9 8765 4321',
          region: 'Región de Valparaíso',
          city: 'Viña del Mar',
          address: 'Av. Libertad 789'
        },
        operationalInfo: {
          industry: 'Energía',
          employees: '11-50',
          revenue: '$50M - $200M'
        }
      },
      {
        id: 3,
        companyName: 'Transportes del Sur Ltda',
        rut: '77.555.333-1',
        email: 'gerencia@transportesdelsur.cl',
        submittedDate: '2025-10-15',
        status: 'approved',
        approvedDate: '2025-10-17',
        documents: [
          { name: 'estatutos_transportes.pdf', type: 'estatutos', uploaded: true, verified: true },
          { name: 'poder_gerente.pdf', type: 'poder', uploaded: true, verified: true },
          { name: 'certificado_sii.pdf', type: 'vigencia', uploaded: true, verified: true }
        ],
        contactInfo: {
          legalRep: 'Carlos Rojas',
          phone: '+56 9 5555 3333',
          region: 'Región del Maule',
          city: 'Talca',
          address: 'Calle Principal 456'
        },
        operationalInfo: {
          industry: 'Transporte y Logística',
          employees: '201-500',
          revenue: '$1.000M - $5.000M'
        }
      }
    ];

    setTimeout(() => {
      setCompanies(mockCompanies);
      setLoading(false);
    }, 500);
  };

  const filteredCompanies = companies.filter(company => {
    const matchesFilter = filter === 'all' || company.status === filter;
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.rut.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
  };

  const handleVerifyDocument = (documentIndex, verified) => {
    if (!selectedCompany) return;

    const updatedCompanies = companies.map(company => {
      if (company.id === selectedCompany.id) {
        const updatedDocs = [...company.documents];
        updatedDocs[documentIndex].verified = verified;
        return { ...company, documents: updatedDocs };
      }
      return company;
    });

    setCompanies(updatedCompanies);
    setSelectedCompany({
      ...selectedCompany,
      documents: updatedCompanies.find(c => c.id === selectedCompany.id).documents
    });
  };

  const handleApproveCompany = () => {
    if (!selectedCompany) return;

    const allDocsVerified = selectedCompany.documents.every(doc => doc.verified);
    
    if (!allDocsVerified) {
      alert('⚠️ Debes verificar todos los documentos antes de aprobar la empresa');
      return;
    }

    const updatedCompanies = companies.map(company => {
      if (company.id === selectedCompany.id) {
        return {
          ...company,
          status: 'approved',
          approvedDate: new Date().toISOString().split('T')[0]
        };
      }
      return company;
    });

    setCompanies(updatedCompanies);
    setSelectedCompany(null);
    alert('✅ Empresa aprobada correctamente');
  };

  const handleRejectCompany = () => {
    if (!selectedCompany) return;

    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    const updatedCompanies = companies.map(company => {
      if (company.id === selectedCompany.id) {
        return {
          ...company,
          status: 'rejected',
          rejectedDate: new Date().toISOString().split('T')[0],
          rejectionReason: reason
        };
      }
      return company;
    });

    setCompanies(updatedCompanies);
    setSelectedCompany(null);
    alert('❌ Empresa rechazada');
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pendiente', class: 'status-pending' },
      approved: { text: 'Aprobada', class: 'status-approved' },
      rejected: { text: 'Rechazada', class: 'status-rejected' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      estatutos: 'Estatutos Sociales',
      poder: 'Poder del Representante',
      vigencia: 'Certificado de Vigencia',
      rut: 'RUT Empresa',
      otros: 'Otros Documentos'
    };
    return labels[type] || type;
  };

  return (
    <div className="verification-panel">
      <div className="panel-header">
        <h1>Panel de Verificación</h1>
        <p>Verifica y aprueba empresas para acceso a la plataforma</p>
      </div>

      <div className="panel-content">
        {/* Sidebar - Lista de empresas */}
        <div className="companies-sidebar">
          <div className="sidebar-header">
            <div className="filter-tabs">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                Todas ({companies.length})
              </button>
              <button
                className={filter === 'pending' ? 'active' : ''}
                onClick={() => setFilter('pending')}
              >
                Pendientes ({companies.filter(c => c.status === 'pending').length})
              </button>
              <button
                className={filter === 'approved' ? 'active' : ''}
                onClick={() => setFilter('approved')}
              >
                Aprobadas ({companies.filter(c => c.status === 'approved').length})
              </button>
            </div>

            <div className="search-box">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="companies-list">
            {loading ? (
              <div className="loading-state">Cargando empresas...</div>
            ) : filteredCompanies.length === 0 ? (
              <div className="empty-state">
                <p>No se encontraron empresas</p>
              </div>
            ) : (
              filteredCompanies.map(company => (
                <div
                  key={company.id}
                  className={`company-item ${selectedCompany?.id === company.id ? 'active' : ''}`}
                  onClick={() => handleSelectCompany(company)}
                >
                  <div className="company-item-header">
                    <h3>{company.companyName}</h3>
                    {getStatusBadge(company.status)}
                  </div>
                  <div className="company-item-details">
                    <span className="company-rut">RUT: {company.rut}</span>
                    <span className="company-date">
                      Enviado: {new Date(company.submittedDate).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main content - Detalles de empresa seleccionada */}
        <div className="company-details">
          {!selectedCompany ? (
            <div className="no-selection">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <h3>Selecciona una empresa</h3>
              <p>Elige una empresa de la lista para ver sus detalles y documentos</p>
            </div>
          ) : (
            <>
              <div className="details-header">
                <div>
                  <h2>{selectedCompany.companyName}</h2>
                  <p className="details-subtitle">RUT: {selectedCompany.rut}</p>
                </div>
                {getStatusBadge(selectedCompany.status)}
              </div>

              {/* Información de contacto */}
              <div className="details-section">
                <h3>Información de Contacto</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Representante Legal:</span>
                    <span className="info-value">{selectedCompany.contactInfo.legalRep}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedCompany.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Teléfono:</span>
                    <span className="info-value">{selectedCompany.contactInfo.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Región:</span>
                    <span className="info-value">{selectedCompany.contactInfo.region}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Ciudad:</span>
                    <span className="info-value">{selectedCompany.contactInfo.city}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Dirección:</span>
                    <span className="info-value">{selectedCompany.contactInfo.address}</span>
                  </div>
                </div>
              </div>

              {/* Información operacional */}
              <div className="details-section">
                <h3>Información Operacional</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Industria:</span>
                    <span className="info-value">{selectedCompany.operationalInfo.industry}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Empleados:</span>
                    <span className="info-value">{selectedCompany.operationalInfo.employees}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Facturación:</span>
                    <span className="info-value">{selectedCompany.operationalInfo.revenue}</span>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="details-section">
                <h3>Documentos Legales</h3>
                <div className="documents-list">
                  {selectedCompany.documents.map((doc, index) => (
                    <div key={index} className="document-item">
                      <div className="document-info">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="document-icon">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4>{getDocumentTypeLabel(doc.type)}</h4>
                          <p>{doc.name}</p>
                        </div>
                      </div>
                      <div className="document-actions">
                        <button
                          className="btn-view"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Ver
                        </button>
                        {selectedCompany.status === 'pending' && (
                          <>
                            {doc.verified ? (
                              <button
                                className="btn-verified"
                                onClick={() => handleVerifyDocument(index, false)}
                              >
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verificado
                              </button>
                            ) : (
                              <button
                                className="btn-verify"
                                onClick={() => handleVerifyDocument(index, true)}
                              >
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Verificar
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              {selectedCompany.status === 'pending' && (
                <div className="details-actions">
                  <button className="btn-reject" onClick={handleRejectCompany}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Rechazar Empresa
                  </button>
                  <button className="btn-approve" onClick={handleApproveCompany}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Aprobar Empresa
                  </button>
                </div>
              )}

              {selectedCompany.status === 'approved' && (
                <div className="approval-info">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Empresa aprobada el {new Date(selectedCompany.approvedDate).toLocaleDateString('es-CL')}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal para ver documento */}
      {showDocumentModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowDocumentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{getDocumentTypeLabel(selectedDocument.type)}</h3>
              <button className="modal-close" onClick={() => setShowDocumentModal(false)}>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="pdf-viewer-placeholder">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <p>Vista previa del documento: {selectedDocument.name}</p>
                <p className="pdf-note">En producción, aquí se mostraría el PDF con un visor integrado</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPanel;
