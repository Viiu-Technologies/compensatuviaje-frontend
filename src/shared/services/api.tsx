import axios from 'axios';

// Configuración base de la API
const API_URL = import.meta.env.VITE_APP_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para agregar token en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Blockchain/public routes don't need auth — skip warning for those
      const url = config.url || '';
      const isPublicRoute = url.includes('/blockchain') || url.includes('/public');
      if (!isPublicRoute) {
        console.warn(`⚠️ [API] No hay token para request a: ${url}`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró (401), intentar refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          // Llamar al endpoint de refresh del backend
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          // El backend devuelve: { success, access_token, refresh_token, expires_in }
          if (response.data.success) {
            const { access_token, refresh_token } = response.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            
            // Reintentar la request original con el nuevo token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar storage y redirigir a login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Extraer mensaje de error del backend
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'Error en la solicitud';

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      error_code: error.response?.data?.error_code
    });
  }
);

export default api;
