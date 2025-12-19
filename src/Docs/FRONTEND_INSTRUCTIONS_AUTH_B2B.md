# 🎨 Instrucciones Frontend - Módulo AUTH + ONBOARD B2B

**Para:** IA Frontend Developer  
**Módulos:** MOD-AUTH + MOD-ONBOARD  
**Prioridad:** 🔴 Crítica - Base del sistema

---

## 📋 Resumen del Trabajo

Implementar el flujo completo de autenticación y onboarding para empresas B2B:

1. **Login/Logout** con JWT
2. **Registro de empresa** con validación RUT chileno
3. **Upload de documentos** legales (contrato, RUT, poderes)
4. **Dashboard de progreso** del onboarding
5. **Gestión de perfil** del usuario
6. **Gestión de usuarios** (solo admin de empresa)

---



---

## 📱 Páginas a Implementar

### 1. Login (`/login`)

**Componentes:**
- Formulario con email y password
- Checkbox "Recordarme"
- Link a "Registrar empresa"
- Mensajes de error específicos

**Flujo:**
1. Usuario ingresa credenciales
2. POST `/api/public/auth/login`
3. Guardar tokens en localStorage
4. Guardar user_info en contexto
5. Redirigir según estado de empresa:
   - `active` → `/dashboard`
   - Otros → `/onboarding`

**Validaciones Frontend:**
- Email formato válido
- Password mínimo 8 caracteres

---

### 2. Registro de Empresa (`/register`)

**Componentes:**
- Wizard de 3 pasos:
  1. Datos de empresa (razón social, RUT, giro)
  2. Datos de contacto (dirección, teléfono)
  3. Datos del admin (nombre, email, password)
- Validación RUT chileno en tiempo real
- Indicador de fortaleza de password

**Flujo:**
1. Completar formulario paso a paso
2. POST `/api/public/companies/register`
3. Mostrar mensaje de éxito con próximos pasos
4. Redirigir a login

**Validaciones Frontend:**

```typescript
// RUT Chileno
const validateRut = (rut: string): boolean => {
  // Limpiar formato
  const cleanRut = rut.replace(/\./g, '').replace('-', '');
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();
  
  // Calcular dígito verificador
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expectedDv = 11 - (sum % 11);
  const dvMap: Record<number, string> = { 11: '0', 10: 'K' };
  const calculatedDv = dvMap[expectedDv] || expectedDv.toString();
  
  return dv === calculatedDv;
};

// Password
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Requiere mayúscula');
  if (!/[a-z]/.test(password)) errors.push('Requiere minúscula');
  if (!/[0-9]/.test(password)) errors.push('Requiere número');
  return { valid: errors.length === 0, errors };
};
```

---

### 3. Dashboard Onboarding (`/onboarding`)

**Componentes:**
- ProgressStepper: Barra de progreso visual (4 pasos)
- Tarjetas de estado por sección:
  - Documentos (con porcentaje)
  - Dominios (verificados/pendientes)
  - Estado general
- NextSteps: Lista de acciones pendientes
- Timeline: Eventos recientes

**API Calls:**
- GET `/api/b2b/dashboard` para datos completos
- GET `/api/b2b/dashboard/progress` para progreso detallado

**Lógica de Estados:**

```typescript
const getStepStatus = (step: ProgressStep) => {
  if (step.completed) return 'completed';
  if (step.percentage > 0) return 'in-progress';
  return 'pending';
};

const getStepIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="text-green-500" />;
    case 'in-progress': return <Clock className="text-yellow-500" />;
    default: return <Circle className="text-gray-400" />;
  }
};
```

---

### 4. Gestión de Documentos (`/onboarding/documents`)

**Componentes:**
- Lista de tipos de documentos requeridos
- Estado de cada documento (subido/pendiente)
- Uploader con drag & drop
- Preview de archivos PDF
- Botón de descarga
- Indicador de validación global

**API Calls:**
- GET `/api/public/config/documents` para tipos disponibles
- GET `/api/b2b/documents` para lista de documentos
- POST `/api/b2b/documents` para subir (multipart/form-data)
- GET `/api/b2b/documents/validation` para validar completitud
- DELETE `/api/b2b/documents/:id` para eliminar

**Componente Uploader:**

```tsx
interface DocumentUploaderProps {
  docType: string;
  onUploadSuccess: (document: Document) => void;
  onUploadError: (error: string) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  docType,
  onUploadSuccess,
  onUploadError
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError('Archivo muy grande (max 10MB)');
      return;
    }

    // Validar tipo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError('Tipo de archivo no permitido');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    try {
      setUploading(true);
      const response = await api.post('/b2b/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / (e.total || 1)));
        }
      });
      onUploadSuccess(response.data.data.document);
    } catch (error) {
      onUploadError(error.response?.data?.message || 'Error al subir');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-6">
      {/* Implementar drop zone */}
    </div>
  );
};
```

---

### 5. Gestión de Perfil (`/profile`)

**Secciones:**
1. Información personal (nombre, email)
2. Cambiar contraseña
3. Preferencias
4. Información de la empresa (solo lectura)

**API Calls:**
- GET `/api/b2b/profile` para datos
- PUT `/api/b2b/profile` para actualizar nombre
- PUT `/api/b2b/profile/password` para cambiar contraseña
- PUT `/api/b2b/profile/email` para cambiar email

---

### 6. Gestión de Usuarios (`/users`) - Solo Admin

**Componentes:**
- Tabla de usuarios con filtros
- Modal para crear usuario
- Modal para editar usuario
- Confirmación para desactivar
- Botón resetear contraseña

**API Calls:**
- GET `/api/b2b/users` con query params
- POST `/api/b2b/users` para crear
- PUT `/api/b2b/users/:id` para editar
- DELETE `/api/b2b/users/:id` para desactivar
- POST `/api/b2b/users/:id/reactivate` para reactivar
- POST `/api/b2b/users/:id/reset-password` para resetear

**Control de Acceso:**

```tsx
// Solo mostrar si es admin
const { user } = useAuth();

if (!user?.is_admin) {
  return <Navigate to="/dashboard" />;
}
```

---

## 🔐 Contexto de Autenticación

```tsx
// contexts/AuthContext.tsx
interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

interface UserInfo {
  user_id: string;
  email: string;
  name: string;
  company_id: string;
  company_name: string;
  role: string;
  permissions: string[];
  is_admin: boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar token al cargar
    const token = localStorage.getItem('access_token');
    if (token) {
      // Validar token con /api/b2b/profile/me
      fetchUserInfo();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/public/auth/login', { email, password });
    const { access_token, refresh_token, user_info } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    setUser(user_info);
  };

  const logout = () => {
    api.post('/b2b/profile/logout').catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🛡️ Rutas Protegidas

```tsx
// components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requireAdmin = false
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user?.is_admin) {
    return <Navigate to="/dashboard" />;
  }

  if (requiredPermissions.length > 0) {
    const hasPermissions = requiredPermissions.every(p => 
      user?.permissions.includes(p)
    );
    if (!hasPermissions) {
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};
```

---

## 🎯 Checklist de Implementación

### Fase 1: Autenticación Base
- [ ] Configurar cliente Axios con interceptors
- [ ] Implementar AuthContext
- [ ] Página de Login funcional
- [ ] Manejo de refresh token automático
- [ ] Logout
- [ ] ProtectedRoute component

### Fase 2: Registro de Empresa
- [ ] Wizard de registro (3 pasos)
- [ ] Validación RUT chileno
- [ ] Validación de password (fortaleza)
- [ ] Manejo de errores (RUT duplicado, email existente)

### Fase 3: Onboarding
- [ ] Dashboard de progreso
- [ ] Lista de documentos requeridos
- [ ] Uploader de documentos
- [ ] Validación de completitud
- [ ] Timeline de eventos

### Fase 4: Perfil y Usuarios
- [ ] Página de perfil
- [ ] Cambio de contraseña
- [ ] Lista de usuarios (solo admin)
- [ ] CRUD de usuarios (solo admin)

---

## ⚠️ Notas Importantes

### Manejo de Errores

```typescript
// Mapeo de códigos de error a mensajes amigables
const ERROR_MESSAGES: Record<string, string> = {
  'INVALID_CREDENTIALS': 'Email o contraseña incorrectos',
  'RATE_LIMIT_EXCEEDED': 'Demasiados intentos. Espera unos minutos.',
  'ACCOUNT_INACTIVE': 'Tu cuenta está desactivada. Contacta al administrador.',
  'INSUFFICIENT_PERMISSIONS': 'No tienes permisos para esta acción.',
  'VALIDATION_ERROR': 'Por favor revisa los datos ingresados.',
  'SYSTEM_ERROR': 'Error del sistema. Intenta nuevamente.'
};
```

### Estados de Empresa

El frontend debe adaptar la UI según el estado:

| Estado | Acceso Permitido |
|--------|------------------|
| `registered` | Solo documentos y perfil |
| `pending_contract` | Solo lectura + documentos |
| `signed` | Solo lectura |
| `active` | Todo |
| `suspended` | Solo lectura básica |

### Tokens

- `access_token`: Guardar en localStorage, usar en headers
- `refresh_token`: Guardar en localStorage, renovar cuando access expire
- Refrescar automáticamente cuando reciba 401

---

## 📞 Soporte

Si encuentras endpoints faltantes o comportamientos inesperados, documenta:

1. Endpoint que intentaste usar
2. Request que enviaste
3. Response que recibiste
4. Comportamiento esperado

Esto permitirá identificar si falta algo en el backend.

---

**Documento generado para IA Frontend - CompensaTuViaje MVP v1.0**
