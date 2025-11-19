import React, { useState } from 'react';
import './BatchUpload.css';

const BatchUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, completed, error
  const [uploadResults, setUploadResults] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      fileName: 'viajes_octubre_2025.csv',
      uploadDate: '2025-10-23',
      totalRows: 150,
      successRows: 145,
      errorRows: 5,
      status: 'completed',
      errors: [
        { row: 12, error: 'Fecha inválida' },
        { row: 34, error: 'RUT incorrecto' },
        { row: 78, error: 'Distancia fuera de rango' },
        { row: 99, error: 'Tipo de transporte no válido' },
        { row: 121, error: 'Emisiones CO2 negativas' }
      ]
    },
    {
      id: 2,
      fileName: 'compensaciones_septiembre.xlsx',
      uploadDate: '2025-09-28',
      totalRows: 200,
      successRows: 200,
      errorRows: 0,
      status: 'completed'
    }
  ]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validar tipo de archivo
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert('❌ Tipo de archivo no válido. Solo se aceptan archivos CSV, XLS o XLSX');
      return;
    }

    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ El archivo es demasiado grande. Tamaño máximo: 10MB');
      return;
    }

    setUploadedFile(file);
    simulateUpload(file);
  };

  const simulateUpload = (file) => {
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simular progreso de carga
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          processFile(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const processFile = (file) => {
    setUploadStatus('processing');

    // Simular procesamiento
    setTimeout(() => {
      const mockResults = {
        fileName: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        totalRows: 180,
        successRows: 175,
        errorRows: 5,
        status: 'completed',
        errors: [
          { row: 15, error: 'Fecha inválida: "32/10/2025"' },
          { row: 42, error: 'RUT incorrecto: formato inválido' },
          { row: 89, error: 'Distancia fuera de rango: -50 km' },
          { row: 103, error: 'Tipo de transporte no válido: "barco"' },
          { row: 156, error: 'Campo requerido: origen vacío' }
        ],
        summary: {
          totalEmissions: 15420.5,
          totalDistance: 45678,
          avgEmissionsPerTrip: 88.4,
          tripsByType: {
            aereo: 45,
            terrestre: 85,
            maritimo: 45
          }
        }
      };

      setUploadResults(mockResults);
      setUploadStatus('completed');
      
      // Agregar al historial
      setUploadHistory(prev => [{
        id: prev.length + 1,
        ...mockResults
      }, ...prev]);
    }, 2000);
  };

  const downloadTemplate = () => {
    // En producción, esto descargará una plantilla CSV/Excel
    alert('📥 Descargando plantilla de ejemplo...\n\nColumnas requeridas:\n- fecha\n- origen\n- destino\n- tipo_transporte\n- distancia_km\n- pasajeros\n- rut_empresa');
  };

  const downloadErrors = (uploadId) => {
    const upload = uploadHistory.find(u => u.id === uploadId) || uploadResults;
    if (upload && upload.errors) {
      alert(`📥 Descargando reporte de errores:\n\n${upload.errors.map(e => `Fila ${e.row}: ${e.error}`).join('\n')}`);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setUploadResults(null);
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') {
      return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="status-icon success">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="batch-upload">
      <div className="batch-header">
        <h1>Carga Masiva de Viajes</h1>
        <p>Importa múltiples viajes desde archivos CSV o Excel</p>
      </div>

      <div className="batch-content">
        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-card">
            {uploadStatus === 'idle' && (
              <>
                <div
                  className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <h3>Arrastra tu archivo aquí</h3>
                  <p>o haz clic para seleccionar</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="btn-select-file">
                    Seleccionar Archivo
                  </label>
                  <p className="file-info">Archivos CSV, XLS o XLSX (máx. 10MB)</p>
                </div>

                <div className="upload-options">
                  <button className="btn-download-template" onClick={downloadTemplate}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                    Descargar Plantilla de Ejemplo
                  </button>

                  <div className="format-info">
                    <h4>Formato esperado:</h4>
                    <ul>
                      <li><strong>fecha:</strong> DD/MM/YYYY</li>
                      <li><strong>origen:</strong> Ciudad o dirección</li>
                      <li><strong>destino:</strong> Ciudad o dirección</li>
                      <li><strong>tipo_transporte:</strong> aereo, terrestre, maritimo</li>
                      <li><strong>distancia_km:</strong> Número positivo</li>
                      <li><strong>pasajeros:</strong> Número entero positivo</li>
                      <li><strong>rut_empresa:</strong> XX.XXX.XXX-X</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
              <div className="upload-progress">
                <svg viewBox="0 0 20 20" fill="currentColor" className="file-icon">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <h3>{uploadedFile?.name}</h3>
                <p className="file-size">{(uploadedFile?.size / 1024).toFixed(2)} KB</p>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  {uploadStatus === 'uploading' && `Cargando archivo... ${uploadProgress}%`}
                  {uploadStatus === 'processing' && 'Procesando datos...'}
                </p>
              </div>
            )}

            {uploadStatus === 'completed' && uploadResults && (
              <div className="upload-complete">
                <svg viewBox="0 0 20 20" fill="currentColor" className="success-icon">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3>¡Carga Completada!</h3>
                <p className="upload-filename">{uploadResults.fileName}</p>

                <div className="results-summary">
                  <div className="summary-card success">
                    <div className="summary-value">{uploadResults.successRows}</div>
                    <div className="summary-label">Viajes Procesados</div>
                  </div>
                  {uploadResults.errorRows > 0 && (
                    <div className="summary-card error">
                      <div className="summary-value">{uploadResults.errorRows}</div>
                      <div className="summary-label">Errores</div>
                    </div>
                  )}
                  <div className="summary-card info">
                    <div className="summary-value">{uploadResults.summary.totalEmissions.toLocaleString('es-CL')} kg</div>
                    <div className="summary-label">CO₂ Total</div>
                  </div>
                  <div className="summary-card info">
                    <div className="summary-value">{uploadResults.summary.totalDistance.toLocaleString('es-CL')} km</div>
                    <div className="summary-label">Distancia Total</div>
                  </div>
                </div>

                {uploadResults.errorRows > 0 && (
                  <div className="errors-section">
                    <h4>Errores Encontrados ({uploadResults.errorRows})</h4>
                    <div className="errors-list">
                      {uploadResults.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="error-item">
                          <span className="error-row">Fila {error.row}</span>
                          <span className="error-message">{error.error}</span>
                        </div>
                      ))}
                    </div>
                    <button className="btn-download-errors" onClick={() => downloadErrors()}>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Descargar Reporte de Errores
                    </button>
                  </div>
                )}

                <button className="btn-new-upload" onClick={resetUpload}>
                  Cargar Otro Archivo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="history-section">
          <h2>Historial de Cargas</h2>
          
          {uploadHistory.length === 0 ? (
            <div className="empty-history">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
              <p>No hay cargas anteriores</p>
            </div>
          ) : (
            <div className="history-list">
              {uploadHistory.map(upload => (
                <div key={upload.id} className="history-item">
                  <div className="history-header">
                    <div className="history-info">
                      {getStatusIcon(upload.status)}
                      <div>
                        <h4>{upload.fileName}</h4>
                        <p className="history-date">
                          {new Date(upload.uploadDate).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="history-stats">
                      <div className="stat success">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {upload.successRows} exitosos
                      </div>
                      {upload.errorRows > 0 && (
                        <div className="stat error">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {upload.errorRows} errores
                        </div>
                      )}
                    </div>
                  </div>
                  {upload.errorRows > 0 && (
                    <button 
                      className="btn-view-errors"
                      onClick={() => downloadErrors(upload.id)}
                    >
                      Ver Errores
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchUpload;
