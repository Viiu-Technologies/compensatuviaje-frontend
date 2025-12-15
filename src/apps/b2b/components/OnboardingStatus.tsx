import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import onboardingService from '../services/onboardingService';
import './OnboardingStatus.css';

const OnboardingStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos mock para demostración
  const mockStatus = {
    companyId: '12345',
    companyName: 'Empresa Demo SpA',
    currentStep: 'document_review',
    overallProgress: 75,
    submittedDate: '2025-10-15',
    lastUpdate: '2025-10-20',
    estimatedCompletion: '2025-10-25',
    
    steps: [
      {
        id: 'registration',
        title: 'Registro Inicial',
        status: 'completed',
        completedDate: '2025-10-15',
        description: 'Información básica y datos de contacto registrados'
      },
      {
        id: 'document_upload',
        title: 'Carga de Documentos',
        status: 'completed',
        completedDate: '2025-10-16',
        description: 'Todos los documentos requeridos han sido subidos'
      },
      {
        id: 'document_review',
        title: 'Revisión de Documentos',
        status: 'in_progress',
        description: 'Nuestro equipo está revisando sus documentos',
        progress: 60,
        reviewer: 'María González',
        notes: [
          { date: '2025-10-18', note: 'Documentos recibidos correctamente' },
          { date: '2025-10-20', note: 'En revisión final' }
        ]
      },
      {
        id: 'approval',
        title: 'Aprobación Final',
        status: 'pending',
        description: 'Aprobación de la solicitud de onboarding'
      },
      {
        id: 'account_setup',
        title: 'Configuración de Cuenta',
        status: 'pending',
        description: 'Creación de cuenta corporativa y accesos'
      }
    ],
    
    documents: [
      {
        id: '1',
        name: 'Licencia Comercial',
        type: 'business_license',
        status: 'approved',
        uploadDate: '2025-10-16',
        reviewDate: '2025-10-18',
        reviewer: 'María González',
        fileName: 'licencia_comercial.pdf',
        size: '2.3 MB'
      },
      {
        id: '2',
        name: 'Certificado de RUT',
        type: 'tax_id',
        status: 'approved',
        uploadDate: '2025-10-16',
        reviewDate: '2025-10-18',
        reviewer: 'María González',
        fileName: 'certificado_rut.pdf',
        size: '1.8 MB'
      },
      {
        id: '3',
        name: 'Poder Notarial',
        type: 'power_of_attorney',
        status: 'pending_review',
        uploadDate: '2025-10-17',
        fileName: 'poder_notarial.pdf',
        size: '3.1 MB',
        notes: 'En revisión'
      }
    ],

    contact: {
      name: 'Juan Pérez',
      email: 'juan.perez@empresa.cl',
      phone: '+56 9 1234 5678',
      assignedManager: 'María González',
      managerEmail: 'maria.gonzalez@compensatuviaje.cl',
      managerPhone: '+56 9 8765 4321'
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      // Simular carga de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus(mockStatus);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <div className="status-icon completed">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'in_progress':
        return (
          <div className="status-icon in-progress">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'pending':
        return (
          <div className="status-icon pending">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-13a1 1 0 011 1v4a1 1 0 01-2 0V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'rejected':
        return (
          <div className="status-icon rejected">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getDocumentStatusBadge = (status) => {
    const badges = {
      approved: { text: 'Aprobado', className: 'badge-success' },
      pending_review: { text: 'En Revisión', className: 'badge-warning' },
      rejected: { text: 'Rechazado', className: 'badge-error' },
      pending: { text: 'Pendiente', className: 'badge-default' }
    };
    
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.className}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Cargando estado del onboarding...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <h2>Error al cargar estado</h2>
        <p>{error}</p>
        <button onClick={loadStatus} className="btn-primary">Reintentar</button>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="empty-container">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
        </svg>
        <h2>No hay onboarding en proceso</h2>
        <p>Comience el proceso de registro empresarial</p>
        <Link to="/onboarding/wizard" className="btn-primary">Iniciar Onboarding</Link>
      </div>
    );
  }

  return (
    <div className="onboarding-status-container">
      <div className="status-header">
        <div className="header-content">
          <div>
            <h1>Estado del Onboarding</h1>
            <p className="company-name">{status.companyName}</p>
          </div>
          <Link to="/dashboard" className="btn-back">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al Dashboard
          </Link>
        </div>
      </div>

      <div className="status-content">
        {/* Progress Overview */}
        <div className="progress-card">
          <div className="card-header">
            <h2>Progreso General</h2>
            <span className="progress-percentage">{status.overallProgress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${status.overallProgress}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <div className="info-item">
              <span className="label">Fecha de Solicitud:</span>
              <span className="value">{new Date(status.submittedDate).toLocaleDateString('es-CL')}</span>
            </div>
            <div className="info-item">
              <span className="label">Última Actualización:</span>
              <span className="value">{new Date(status.lastUpdate).toLocaleDateString('es-CL')}</span>
            </div>
            <div className="info-item">
              <span className="label">Finalización Estimada:</span>
              <span className="value">{new Date(status.estimatedCompletion).toLocaleDateString('es-CL')}</span>
            </div>
          </div>
        </div>

        {/* Timeline Steps */}
        <div className="timeline-card">
          <h2>Proceso de Onboarding</h2>
          <div className="timeline">
            {status.steps.map((step, index) => (
              <div key={step.id} className={`timeline-item ${step.status}`}>
                <div className="timeline-marker">
                  {getStatusIcon(step.status)}
                  {index < status.steps.length - 1 && <div className="timeline-line"></div>}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h3>{step.title}</h3>
                    {step.completedDate && (
                      <span className="timeline-date">
                        Completado: {new Date(step.completedDate).toLocaleDateString('es-CL')}
                      </span>
                    )}
                  </div>
                  <p className="timeline-description">{step.description}</p>
                  
                  {step.status === 'in_progress' && step.progress && (
                    <div className="step-progress">
                      <div className="progress-bar small">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${step.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{step.progress}%</span>
                    </div>
                  )}

                  {step.reviewer && (
                    <div className="reviewer-info">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>Asignado a: {step.reviewer}</span>
                    </div>
                  )}

                  {step.notes && step.notes.length > 0 && (
                    <div className="step-notes">
                      <h4>Notas:</h4>
                      {step.notes.map((note, idx) => (
                        <div key={idx} className="note-item">
                          <span className="note-date">{new Date(note.date).toLocaleDateString('es-CL')}</span>
                          <span className="note-text">{note.note}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid-layout">
          {/* Documents Status */}
          <div className="documents-card">
            <h2>Estado de Documentos</h2>
            <div className="documents-list">
              {status.documents.map(doc => (
                <div key={doc.id} className="document-item">
                  <div className="document-info">
                    <div className="document-icon-wrapper">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="document-details">
                      <h3>{doc.name}</h3>
                      <div className="document-meta">
                        <span className="file-name">{doc.fileName}</span>
                        <span className="file-size">{doc.size}</span>
                      </div>
                      <div className="document-dates">
                        <span>Subido: {new Date(doc.uploadDate).toLocaleDateString('es-CL')}</span>
                        {doc.reviewDate && (
                          <span> | Revisado: {new Date(doc.reviewDate).toLocaleDateString('es-CL')}</span>
                        )}
                      </div>
                      {doc.reviewer && (
                        <span className="reviewer">Revisado por: {doc.reviewer}</span>
                      )}
                      {doc.notes && (
                        <p className="document-notes">{doc.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="document-status">
                    {getDocumentStatusBadge(doc.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-card">
            <h2>Información de Contacto</h2>
            <div className="contact-section">
              <h3>Su Contacto</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>{status.contact.name}</span>
                </div>
                <div className="contact-item">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a href={`mailto:${status.contact.email}`}>{status.contact.email}</a>
                </div>
                <div className="contact-item">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <a href={`tel:${status.contact.phone}`}>{status.contact.phone}</a>
                </div>
              </div>
            </div>

            <div className="contact-section">
              <h3>Gerente Asignado</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>{status.contact.assignedManager}</span>
                </div>
                <div className="contact-item">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a href={`mailto:${status.contact.managerEmail}`}>{status.contact.managerEmail}</a>
                </div>
                <div className="contact-item">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <a href={`tel:${status.contact.managerPhone}`}>{status.contact.managerPhone}</a>
                </div>
              </div>
            </div>

            <div className="help-section">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div>
                <strong>¿Necesita ayuda?</strong>
                <p>Contacte a su gerente asignado para cualquier consulta sobre el proceso.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStatus;
