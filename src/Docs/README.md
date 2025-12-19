# 📚 Documentación Frontend - Índice

**Módulos:** AUTH + ONBOARD (B2B)  
**Generado:** 19 Diciembre 2025

---

## 📁 Archivos de Documentación

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| [API_AUTH_B2B_CONTRACT.md](./API_AUTH_B2B_CONTRACT.md) | Contrato completo de API | Referencia para integrar endpoints |
| [FRONTEND_INSTRUCTIONS_AUTH_B2B.md](./FRONTEND_INSTRUCTIONS_AUTH_B2B.md) | Instrucciones de implementación | Guía paso a paso para la IA |
| [TYPESCRIPT_TYPES_AUTH_B2B.md](./TYPESCRIPT_TYPES_AUTH_B2B.md) | Tipos TypeScript | Copiar a `src/types/` |
| [BACKEND_ISSUES_TO_FIX.md](./BACKEND_ISSUES_TO_FIX.md) | Issues resueltos | ✅ Ya corregidos |

---

## 🎯 Orden de Implementación Sugerido

### Fase 1: Infraestructura (Día 1)
1. Configurar cliente Axios con interceptors
2. Implementar AuthContext
3. Crear ProtectedRoute component
4. Configurar tipos TypeScript

### Fase 2: Autenticación (Día 2)
1. Página de Login
2. Manejo de tokens (localStorage)
3. Refresh token automático
4. Logout

### Fase 3: Registro (Día 3)
1. Wizard de registro de empresa
2. Validación RUT chileno
3. Validación de password
4. Flujo post-registro

### Fase 4: Onboarding (Día 4-5)
1. Dashboard de progreso
2. Lista de documentos
3. Uploader de documentos
4. Validación de completitud
5. Timeline de eventos

### Fase 5: Perfil y Usuarios (Día 6)
1. Página de perfil
2. Cambio de contraseña
3. Lista de usuarios (admin)
4. CRUD de usuarios (admin)

---

## 🔗 Endpoints Principales

### Públicos (sin auth)
```
POST /api/public/auth/login
POST /api/public/auth/refresh
POST /api/public/companies/register
GET  /api/public/config/documents
POST /api/public/validate/airport-code
GET  /api/public/validate/domain-info/:domain
```

### B2B (requiere auth)
```
# Perfil
GET  /api/b2b/profile
PUT  /api/b2b/profile
PUT  /api/b2b/profile/password
PUT  /api/b2b/profile/email
GET  /api/b2b/profile/me
POST /api/b2b/profile/logout

# Empresa
GET  /api/b2b/company
PUT  /api/b2b/company
GET  /api/b2b/company/domains
POST /api/b2b/company/domains
POST /api/b2b/company/validate-email

# Documentos
GET  /api/b2b/documents
POST /api/b2b/documents
GET  /api/b2b/documents/validation
GET  /api/b2b/documents/:id/download
DELETE /api/b2b/documents/:id

# Dashboard
GET  /api/b2b/dashboard
GET  /api/b2b/dashboard/progress
GET  /api/b2b/dashboard/timeline

# Usuarios (solo admin)
GET  /api/b2b/users
POST /api/b2b/users
PUT  /api/b2b/users/:userId
DELETE /api/b2b/users/:userId
POST /api/b2b/users/:userId/reactivate
POST /api/b2b/users/:userId/reset-password
```

---

## ⚠️ Notas Importantes

1. **Base URL:** `http://localhost:3002/api`
2. **Tokens:** Guardar en localStorage
3. **Refresh:** Automático cuando access token expire
4. **Rate Limits:** Ver contrato para detalles
5. **Validación RUT:** Implementar en frontend (ver instrucciones)

---

## 🧪 Probar Backend

```bash
# Iniciar servidor
cd backend
npm run dev

# Probar login
curl -X POST http://localhost:3002/api/public/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!"}'
```

---

**¡Listo para implementar!**
