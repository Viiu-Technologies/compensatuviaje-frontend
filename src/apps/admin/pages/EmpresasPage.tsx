import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Eye,
  CheckCircle,
  Clock,
  MoreHorizontal,
  FileText,
  Pause,
  Play,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { getCompanies, Company, updateCompanyStatus } from '../services/adminApi';
import { toast } from 'sonner';
import {
  EmptyState,
  Modal,
  PageHeader,
  Pagination,
  SearchField,
  Segmented,
  StatusBadge,
  TableSkeletonRows,
  formatInt,
  COMPANY_STATUS,
  companyStatusLabel,
  industryLabel,
} from '../ui';

const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'registered', label: 'Registradas' },
  { value: 'pending_contract', label: 'Pendiente de contrato' },
  { value: 'signed', label: 'Contrato firmado' },
  { value: 'active', label: 'Activas' },
  { value: 'suspended', label: 'Suspendidas' },
];

const VALID_TRANSITIONS: Record<string, string[]> = {
  registered: ['pending_contract', 'suspended'],
  pending_contract: ['signed', 'registered', 'suspended'],
  signed: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

const TRANSITION_LABELS: Record<string, string> = {
  suspended: 'Suspender',
  active: 'Activar',
  pending_contract: 'Enviar a contrato',
  signed: 'Marcar contrato firmado',
  registered: 'Volver a registrada',
};

const TRANSITION_ICONS: Record<string, LucideIcon> = {
  pending_contract: FileText,
  signed: CheckCircle,
  active: Play,
  suspended: Pause,
  registered: Clock,
};

const statusConfig = COMPANY_STATUS;
const statusLabel = companyStatusLabel;

export default function EmpresasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const statusFilter = searchParams.get('status') || '';

  // Menú de acciones por fila (se dibuja fuera de la tabla para no quedar recortado)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!openDropdown) return;
    const close = () => setOpenDropdown(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('scroll', close, true);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [openDropdown]);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => { loadCompanies(); }, [searchParams]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompanies({
        page: parseInt(searchParams.get('page') || '1'),
        limit: 20,
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setCompanies(data.companies || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      setLoadError(false);
    } catch (error) {
      console.error('Error loading companies:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  // Cambia un parámetro y vuelve a la página 1, conservando los demás filtros.
  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  // Antes los botones de página hacían setSearchParams({ page }) y se
  // perdían la búsqueda y el filtro de estado.
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam('search', search.trim());
  };

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, companyId: string) => {
    if (openDropdown === companyId) {
      setOpenDropdown(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuH = 200;
    const top = window.innerHeight - rect.bottom < menuH ? rect.top - menuH : rect.bottom + 4;
    setMenuPos({ top: Math.max(8, top), left: Math.max(8, rect.right - 220) });
    setOpenDropdown(companyId);
  };

  const openStatusChangeModal = (company: Company, toStatus: string) => {
    setSelectedCompany(company);
    setNewStatus(toStatus);
    setStatusNote('');
    setOpenDropdown(null);
  };

  const closeStatusModal = () => {
    setSelectedCompany(null);
    setNewStatus('');
  };

  const handleChangeStatus = async () => {
    if (!selectedCompany || !newStatus) return;
    setChangingStatus(true);
    try {
      await updateCompanyStatus(selectedCompany.id, newStatus, statusNote || undefined);
      toast.success(`${selectedCompany.nombreComercial || selectedCompany.razonSocial}: ${statusLabel(newStatus).toLowerCase()}`);
      closeStatusModal();
      await loadCompanies();
    } catch (err) {
      console.error('Error:', err);
      toast.error('No pudimos cambiar el estado. Vuelve a intentarlo.');
    } finally {
      setChangingStatus(false);
    }
  };

  const menuCompany = openDropdown ? companies.find((c) => c.id === openDropdown) : null;

  return (
    <div className="adm-page">
      <PageHeader
        title="Empresas B2B"
        description="Empresas registradas en la plataforma y el estado de su contrato."
      />

      {loadError && (
        <div role="alert" className="adm-alert adm-alert--danger">
          <AlertTriangle aria-hidden="true" />
          <div><b>No se pudo cargar la lista de empresas.</b> Revisa la conexión y vuelve a intentar.</div>
        </div>
      )}

      <section className="adm-table-card">
        <div className="adm-toolbar">
          <form onSubmit={handleSearch} role="search">
            <SearchField
              label="Buscar empresas"
              placeholder="Buscar por nombre, RUT o email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="adm-btn">Buscar</button>
          </form>
          <Segmented
            label="Filtrar por estado"
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(v) => setParam('status', v)}
          />
        </div>

        <div className="adm-table-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Empresa</th>
                <th scope="col">RUT</th>
                <th scope="col">Industria</th>
                <th scope="col">Estado</th>
                <th scope="col" className="adm-col-num">Documentos</th>
                <th scope="col">Registro</th>
                <th scope="col" className="adm-col-actions"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows columns={7} />
              ) : companies.length > 0 ? (
                companies.map((company) => {
                  const name = company.nombreComercial || company.razonSocial;
                  const status = statusConfig[company.status];
                  return (
                    <tr key={company.id}>
                      <td>
                        <Link to={`/admin/empresas/${company.id}`} className="adm-cell-main">
                          <span className="adm-cell-initial" aria-hidden="true">{name.charAt(0)}</span>
                          <span>
                            <span className="adm-cell-title">{name}</span>
                            {company.nombreComercial && company.razonSocial !== company.nombreComercial && (
                              <span className="adm-cell-sub">{company.razonSocial}</span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td>{company.rut || <span className="adm-cell-mute">—</span>}</td>
                      <td>
                        {company.industry
                          ? industryLabel(company.industry)
                          : <span className="adm-cell-mute">Sin categoría</span>}
                      </td>
                      <td>
                        <StatusBadge tone={status?.tone ?? 'neutral'}>{status?.label ?? company.status}</StatusBadge>
                      </td>
                      <td className="adm-col-num">{formatInt(company._count?.documents)}</td>
                      <td>{new Date(company.createdAt).toLocaleDateString('es-CL')}</td>
                      <td className="adm-col-actions">
                        <Link to={`/admin/empresas/${company.id}`} className="adm-icon-btn" title="Ver detalle" aria-label={`Ver detalle de ${name}`}>
                          <Eye aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          className="adm-icon-btn"
                          onClick={(e) => openMenu(e, company.id)}
                          aria-haspopup="menu"
                          aria-expanded={openDropdown === company.id}
                          aria-label={`Acciones para ${name}`}
                        >
                          <MoreHorizontal aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Building2}
                      title="No se encontraron empresas"
                      text={searchParams.get('search') || statusFilter ? 'Prueba con otra búsqueda o quita el filtro de estado.' : undefined}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            shown={companies.length}
            noun="empresas"
            onPage={goToPage}
          />
        )}
      </section>

      {/* Menú de acciones de la fila */}
      {menuCompany && (
        <>
          <div className="adm-overlay-clear" onClick={() => setOpenDropdown(null)} />
          <div className="adm-menu" role="menu" style={{ top: menuPos.top, left: menuPos.left }}>
            <button type="button" role="menuitem" onClick={() => { setOpenDropdown(null); navigate(`/admin/empresas/${menuCompany.id}`); }}>
              <Eye aria-hidden="true" />
              Ver detalle completo
            </button>
            {(VALID_TRANSITIONS[menuCompany.status] || []).length > 0 && <hr />}
            {(VALID_TRANSITIONS[menuCompany.status] || []).map((toStatus) => {
              const Icon = TRANSITION_ICONS[toStatus] ?? Clock;
              return (
                <button
                  key={toStatus}
                  type="button"
                  role="menuitem"
                  className={toStatus === 'suspended' ? 'adm-menu__danger' : undefined}
                  onClick={() => openStatusChangeModal(menuCompany, toStatus)}
                >
                  <Icon aria-hidden="true" />
                  {TRANSITION_LABELS[toStatus] ?? statusLabel(toStatus)}
                </button>
              );
            })}
          </div>
        </>
      )}

      <Modal
        open={!!selectedCompany}
        title="Cambiar estado"
        onClose={closeStatusModal}
        busy={changingStatus}
        footer={
          <>
            <button type="button" className="adm-btn" onClick={closeStatusModal} disabled={changingStatus}>Cancelar</button>
            <button
              type="button"
              className={`adm-btn ${newStatus === 'suspended' ? 'adm-btn--danger' : 'adm-btn--primary'}`}
              onClick={handleChangeStatus}
              disabled={changingStatus}
            >
              {changingStatus ? 'Guardando…' : TRANSITION_LABELS[newStatus] ?? 'Confirmar'}
            </button>
          </>
        }
      >
        {selectedCompany && (
          <>
            <p>
              <b>{selectedCompany.nombreComercial || selectedCompany.razonSocial}</b> pasará de{' '}
              <StatusBadge tone={statusConfig[selectedCompany.status]?.tone ?? 'neutral'}>{statusLabel(selectedCompany.status)}</StatusBadge>{' '}
              a <StatusBadge tone={statusConfig[newStatus]?.tone ?? 'neutral'}>{statusLabel(newStatus)}</StatusBadge>.
            </p>
            {newStatus === 'suspended' && (
              <div className="adm-alert adm-alert--danger">
                <AlertTriangle aria-hidden="true" />
                <div>Todos los usuarios de la empresa perderán el acceso mientras esté suspendida.</div>
              </div>
            )}
            <div className="adm-field">
              <label className="adm-field__label" htmlFor="adm-status-note">Nota (opcional)</label>
              <textarea
                id="adm-status-note"
                className="adm-textarea"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Motivo del cambio"
                rows={3}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
