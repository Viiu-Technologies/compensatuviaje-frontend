const API_URL = import.meta.env.VITE_APP_API_URL;

class OnboardingService {
  // Helper para headers con autenticación
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // ==========================================
  // COMPANY MANAGEMENT
  // ==========================================

  // Obtener información de la empresa actual
  async getMyCompany() {
    try {
      const response = await fetch(`${API_URL}/onboard/companies/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener datos de la empresa');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar información de la empresa
  async updateCompany(companyId, companyData) {
    try {
      const response = await fetch(`${API_URL}/onboard/companies/${companyId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(companyData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar empresa');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener estado de onboarding
  async getOnboardingStatus(companyId) {
    try {
      const response = await fetch(`${API_URL}/onboard/companies/${companyId}/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estado');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // ==========================================
  // DOCUMENT MANAGEMENT
  // ==========================================

  // Subir documento
  async uploadDocument(companyId, documentData, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentData.documentType);
      if (documentData.description) {
        formData.append('description', documentData.description);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/onboard/companies/${companyId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir documento');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener documentos de una empresa
  async getCompanyDocuments(companyId) {
    try {
      const response = await fetch(`${API_URL}/onboard/companies/${companyId}/documents`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener documentos');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar documento
  async deleteDocument(documentId) {
    try {
      const response = await fetch(`${API_URL}/onboard/documents/${documentId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar documento');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Descargar documento
  async downloadDocument(documentId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/onboard/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Error al descargar documento');
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      throw error;
    }
  }

  // ==========================================
  // VERIFICATION (ADMIN)
  // ==========================================

  // Obtener empresas pendientes de verificación
  async getPendingCompanies() {
    try {
      const response = await fetch(`${API_URL}/onboard/admin/verification/pending`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener empresas pendientes');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las empresas para verificación
  async getAllCompanies(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_URL}/onboard/admin/verification?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener empresas');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // Verificar documento
  async verifyDocument(documentId, verified) {
    try {
      const response = await fetch(`${API_URL}/onboard/admin/verification/documents/${documentId}/verify`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ verified })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar documento');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // Aprobar empresa
  async approveCompany(companyId) {
    try {
      const response = await fetch(`${API_URL}/onboard/admin/verification/companies/${companyId}/approve`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al aprobar empresa');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // Rechazar empresa
  async rejectCompany(companyId, reason) {
    try {
      const response = await fetch(`${API_URL}/onboard/admin/verification/companies/${companyId}/reject`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al rechazar empresa');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  // Obtener datos del dashboard
  async getDashboardData() {
    try {
      const response = await fetch(`${API_URL}/onboard/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener datos del dashboard');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de onboarding
  async getOnboardingStats() {
    try {
      const response = await fetch(`${API_URL}/onboard/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }

      return data.data;
    } catch (error) {
      throw error;
    }
  }
}

const onboardingService = new OnboardingService();
export default onboardingService;
