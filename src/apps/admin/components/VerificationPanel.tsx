import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Eye, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Download,
  ExternalLink,
  User,
  Briefcase,
  TrendingUp
} from 'lucide-react';

const VerificationPanel = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

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

  const handleSelectCompany = (company: any) => {
    setSelectedCompany(company);
  };

  const handleVerifyDocument = (documentIndex: number, verified: boolean) => {
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
    const updatedSelected = updatedCompanies.find(c => c.id === selectedCompany.id);
    setSelectedCompany(updatedSelected);
  };

  const handleApproveCompany = () => {
    if (!selectedCompany) return;

    const allDocsVerified = selectedCompany.documents.every((doc: any) => doc.verified);
    
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-[10px] !font-black !uppercase !tracking-wider !bg-emerald-100 !text-emerald-700">
            <CheckCircle2 className="!w-3 !h-3" /> Aprobada
          </span>
        );
      case 'rejected':
        return (
          <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-[10px] !font-black !uppercase !tracking-wider !bg-red-100 !text-red-700">
            <XCircle className="!w-3 !h-3" /> Rechazada
          </span>
        );
      default:
        return (
          <span className="!inline-flex !items-center !gap-1.5 !px-3 !py-1 !rounded-full !text-[10px] !font-black !uppercase !tracking-wider !bg-amber-100 !text-amber-700">
            <Clock className="!w-3 !h-3" /> Pendiente
          </span>
        );
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: any = {
      estatutos: 'Estatutos Sociales',
      poder: 'Poder del Representante',
      vigencia: 'Certificado de Vigencia',
      rut: 'RUT Empresa',
      otros: 'Otros Documentos'
    };
    return labels[type] || type;
  };

  return (
    <div className="!space-y-8 !animate-in !fade-in !duration-700">
      {/* Header Section */}
      <div className="!flex !flex-col md:!flex-row md:!items-center !justify-between !gap-4">
        <div>
          <h1 className="!text-4xl !font-black !text-slate-900 !tracking-tight !mb-2">
            Panel de <span className="!text-emerald-600">Verificación</span>
          </h1>
          <p className="!text-slate-500 !font-medium">
            Revisa y valida la documentación legal de las empresas registradas.
          </p>
        </div>
        <div className="!flex !items-center !gap-3">
          <div className="!bg-white !px-4 !py-2 !rounded-2xl !shadow-sm !border !border-slate-100 !flex !items-center !gap-3">
            <div className="!w-10 !h-10 !bg-amber-100 !rounded-xl !flex !items-center !justify-center">
              <Clock className="!w-5 !h-5 !text-amber-600" />
            </div>
            <div>
              <p className="!text-[10px] !font-black !text-slate-400 !uppercase !tracking-widest">Pendientes</p>
              <p className="!text-lg !font-black !text-slate-900">{companies.filter(c => c.status === 'pending').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="!grid !grid-cols-1 lg:!grid-cols-12 !gap-8 !items-start">
        {/* Sidebar - Lista de empresas */}
        <div className="lg:!col-span-4 !space-y-6">
          <div className="!bg-white !p-6 !rounded-[2.5rem] !shadow-sm !border !border-slate-100">
            <div className="!space-y-4">
              <div className="!relative">
                <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-5 !h-5 !text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o RUT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="!w-full !bg-slate-50 !border-none !rounded-2xl !pl-12 !pr-4 !py-3 !font-bold !text-slate-700 !focus:ring-2 !focus:ring-emerald-500"
                />
              </div>

              <div className="!flex !flex-wrap !gap-2">
                {['all', 'pending', 'approved'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`!px-4 !py-2 !rounded-xl !text-xs !font-black !uppercase !tracking-wider !transition-all ${
                      filter === f
                        ? '!bg-slate-900 !text-white !shadow-lg'
                        : '!bg-slate-50 !text-slate-500 !hover:bg-slate-100'
                    }`}
                  >
                    {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : 'Aprobadas'}
                  </button>
                ))}
              </div>
            </div>

            <div className="!mt-6 !space-y-3 !max-h-[600px] !overflow-y-auto !pr-2 !custom-scrollbar">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="!h-24 !bg-slate-50 !rounded-2xl !animate-pulse" />
                ))
              ) : filteredCompanies.length === 0 ? (
                <div className="!text-center !py-12">
                  <AlertCircle className="!w-12 !h-12 !text-slate-200 !mx-auto !mb-4" />
                  <p className="!text-slate-400 !font-bold">No hay empresas</p>
                </div>
              ) : (
                filteredCompanies.map(company => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company)}
                    className={`!w-full !text-left !p-4 !rounded-2xl !transition-all !group ${
                      selectedCompany?.id === company.id
                        ? '!bg-emerald-50 !border-2 !border-emerald-200 !shadow-md'
                        : '!bg-white !border-2 !border-transparent !hover:bg-slate-50'
                    }`}
                  >
                    <div className="!flex !justify-between !items-start !mb-2">
                      <h3 className={`!font-black !text-sm !transition-colors ${
                        selectedCompany?.id === company.id ? '!text-emerald-900' : '!text-slate-900'
                      }`}>
                        {company.companyName}
                      </h3>
                      {getStatusBadge(company.status)}
                    </div>
                    <div className="!flex !items-center !justify-between">
                      <span className="!text-[10px] !font-bold !text-slate-400">RUT: {company.rut}</span>
                      <ChevronRight className={`!w-4 !h-4 !transition-transform ${
                        selectedCompany?.id === company.id ? '!text-emerald-500 !translate-x-1' : '!text-slate-300'
                      }`} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main content - Detalles de empresa seleccionada */}
        <div className="lg:!col-span-8">
          {!selectedCompany ? (
            <div className="!bg-white !rounded-[2.5rem] !border-2 !border-dashed !border-slate-200 !p-20 !text-center">
              <div className="!w-20 !h-20 !bg-slate-50 !rounded-3xl !flex !items-center !justify-center !mx-auto !mb-6">
                <ShieldCheck className="!w-10 !h-10 !text-slate-300" />
              </div>
              <h3 className="!text-xl !font-black !text-slate-900 !mb-2">Selecciona una empresa</h3>
              <p className="!text-slate-500 !max-w-xs !mx-auto">
                Elige una empresa de la lista lateral para revisar su información legal y documentos adjuntos.
              </p>
            </div>
          ) : (
            <div className="!space-y-8 !animate-in !slide-in-from-right-8 !duration-500">
              {/* Company Header Info */}
              <div className="!bg-slate-900 !rounded-[2.5rem] !p-8 !text-white !relative !overflow-hidden">
                <div className="!absolute !top-0 !right-0 !w-64 !h-64 !bg-emerald-500/10 !rounded-full !-mr-32 !-mt-32 !blur-3xl" />
                <div className="!relative !flex !flex-col md:!flex-row !justify-between !items-start !gap-6">
                  <div className="!flex !items-center !gap-6">
                    <div className="!w-20 !h-20 !bg-white/10 !backdrop-blur-md !rounded-3xl !flex !items-center !justify-center !border !border-white/20">
                      <Building2 className="!w-10 !h-10 !text-emerald-400" />
                    </div>
                    <div>
                      <div className="!flex !items-center !gap-3 !mb-2">
                        <h2 className="!text-3xl !font-black">{selectedCompany.companyName}</h2>
                        {getStatusBadge(selectedCompany.status)}
                      </div>
                      <div className="!flex !flex-wrap !gap-4 !text-slate-400 !text-sm !font-medium">
                        <span className="!flex !items-center !gap-1.5"><ShieldCheck className="!w-4 !h-4" /> RUT: {selectedCompany.rut}</span>
                        <span className="!flex !items-center !gap-1.5"><Mail className="!w-4 !h-4" /> {selectedCompany.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCompany.status === 'pending' && (
                    <div className="!flex !gap-3">
                      <button
                        onClick={handleRejectCompany}
                        className="!bg-white/10 !hover:bg-red-500/20 !text-white !px-6 !py-3 !rounded-2xl !font-bold !transition-all !border !border-white/10 !flex !items-center !gap-2"
                      >
                        <XCircle className="!w-5 !h-5" /> Rechazar
                      </button>
                      <button
                        onClick={handleApproveCompany}
                        className="!bg-emerald-600 !hover:bg-emerald-500 !text-white !px-8 !py-3 !rounded-2xl !font-bold !transition-all !shadow-xl !shadow-emerald-900/20 !flex !items-center !gap-2"
                      >
                        <CheckCircle2 className="!w-5 !h-5" /> Aprobar Empresa
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-8">
                {/* Contact Info */}
                <div className="!bg-white !p-8 !rounded-[2.5rem] !shadow-sm !border !border-slate-100">
                  <h3 className="!text-lg !font-black !text-slate-900 !mb-6 !flex !items-center !gap-2">
                    <User className="!w-5 !h-5 !text-emerald-600" /> Información de Contacto
                  </h3>
                  <div className="!space-y-4">
                    <div className="!flex !justify-between !p-4 !bg-slate-50 !rounded-2xl">
                      <span className="!text-slate-500 !font-bold !text-sm">Representante Legal</span>
                      <span className="!text-slate-900 !font-black !text-sm">{selectedCompany.contactInfo.legalRep}</span>
                    </div>
                    <div className="!flex !justify-between !p-4 !bg-slate-50 !rounded-2xl">
                      <span className="!text-slate-500 !font-bold !text-sm">Teléfono</span>
                      <span className="!text-slate-900 !font-black !text-sm">{selectedCompany.contactInfo.phone}</span>
                    </div>
                    <div className="!flex !justify-between !p-4 !bg-slate-50 !rounded-2xl">
                      <span className="!text-slate-500 !font-bold !text-sm">Ubicación</span>
                      <span className="!text-slate-900 !font-black !text-sm">{selectedCompany.contactInfo.city}, {selectedCompany.contactInfo.region}</span>
                    </div>
                  </div>
                </div>

                {/* Operational Info */}
                <div className="!bg-white !p-8 !rounded-[2.5rem] !shadow-sm !border !border-slate-100">
                  <h3 className="!text-lg !font-black !text-slate-900 !mb-6 !flex !items-center !gap-2">
                    <Briefcase className="!w-5 !h-5 !text-blue-600" /> Información Operativa
                  </h3>
                  <div className="!space-y-4">
                    <div className="!flex !justify-between !p-4 !bg-slate-50 !rounded-2xl">
                      <span className="!text-slate-500 !font-bold !text-sm">Industria</span>
                      <span className="!text-slate-900 !font-black !text-sm">{selectedCompany.operationalInfo.industry}</span>
                    </div>
                    <div className="!flex !justify-between !p-4 !bg-slate-50 !rounded-2xl">
                      <span className="!text-slate-500 !font-bold !text-sm">Empleados</span>
                      <span className="!text-slate-900 !font-black !text-sm">{selectedCompany.operationalInfo.employees}</span>
                    </div>
                    <div className="!flex !justify-between !p-4 !bg-slate-50 !rounded-2xl">
                      <span className="!text-slate-500 !font-bold !text-sm">Facturación Anual</span>
                      <span className="!text-slate-900 !font-black !text-sm">{selectedCompany.operationalInfo.revenue}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="!bg-white !p-8 !rounded-[2.5rem] !shadow-sm !border !border-slate-100">
                <div className="!flex !items-center !justify-between !mb-8">
                  <h3 className="!text-xl !font-black !text-slate-900 !flex !items-center !gap-2">
                    <FileText className="!w-6 !h-6 !text-emerald-600" /> Documentación Legal
                  </h3>
                  <span className="!text-xs !font-black !text-slate-400 !uppercase !tracking-widest">
                    {selectedCompany.documents.filter((d: any) => d.verified).length} de {selectedCompany.documents.length} Verificados
                  </span>
                </div>

                <div className="!grid !grid-cols-1 !gap-4">
                  {selectedCompany.documents.map((doc: any, index: number) => (
                    <div
                      key={index}
                      className={`!flex !flex-col md:!flex-row md:!items-center !justify-between !p-6 !rounded-3xl !border-2 !transition-all ${
                        doc.verified 
                          ? '!bg-emerald-50/30 !border-emerald-100' 
                          : '!bg-slate-50 !border-transparent'
                      }`}
                    >
                      <div className="!flex !items-center !gap-4 !mb-4 md:!mb-0">
                        <div className={`!w-12 !h-12 !rounded-2xl !flex !items-center !justify-center ${
                          doc.verified ? '!bg-emerald-100 !text-emerald-600' : '!bg-white !text-slate-400'
                        }`}>
                          <FileText className="!w-6 !h-6" />
                        </div>
                        <div>
                          <p className="!text-sm !font-black !text-slate-900">{getDocumentTypeLabel(doc.type)}</p>
                          <p className="!text-xs !font-medium !text-slate-500">{doc.name}</p>
                        </div>
                      </div>

                      <div className="!flex !items-center !gap-3">
                        <button className="!p-3 !bg-white !rounded-xl !text-slate-600 !hover:text-emerald-600 !shadow-sm !transition-all">
                          <Eye className="!w-5 !h-5" />
                        </button>
                        <button className="!p-3 !bg-white !rounded-xl !text-slate-600 !hover:text-emerald-600 !shadow-sm !transition-all">
                          <Download className="!w-5 !h-5" />
                        </button>
                        <div className="!h-8 !w-px !bg-slate-200 !mx-2" />
                        {doc.verified ? (
                          <button
                            onClick={() => handleVerifyDocument(index, false)}
                            className="!flex !items-center !gap-2 !bg-emerald-600 !text-white !px-4 !py-2 !rounded-xl !text-xs !font-black !uppercase !tracking-wider"
                          >
                            <CheckCircle2 className="!w-4 !h-4" /> Verificado
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyDocument(index, true)}
                            className="!flex !items-center !gap-2 !bg-white !text-slate-900 !border !border-slate-200 !px-4 !py-2 !rounded-xl !text-xs !font-black !uppercase !tracking-wider !hover:bg-emerald-50 !hover:border-emerald-200 !hover:text-emerald-600 !transition-all"
                          >
                            Marcar como Válido
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPanel;
