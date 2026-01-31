# 📦 Módulo Partner - Frontend

## Descripción

El módulo Partner es el portal de gestión para organizaciones ESG (Environmental, Social, and Governance) que ofrecen proyectos de compensación de carbono a través de la plataforma CompensaTuViaje.

## Estructura de Archivos

```
src/apps/partner/
├── index.ts                    # Exportaciones del módulo
├── components/
│   └── PartnerLayout.tsx       # Layout con sidebar y topbar
├── pages/
│   ├── PartnerDashboard.tsx    # Dashboard principal
│   ├── PartnerProfile.tsx      # Perfil y configuración
│   ├── PartnerProjects.tsx     # Lista de proyectos
│   ├── ProjectDetail.tsx       # Detalle de proyecto
│   └── ProjectForm.tsx         # Crear/Editar proyecto
├── routes/
│   └── PartnerRoutes.tsx       # Configuración de rutas
└── services/
    └── partnerApi.ts           # Servicios API

src/types/
└── partner.types.ts            # Tipos TypeScript
```

## Rutas Disponibles

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/partner` | PartnerDashboard | Dashboard con estadísticas y onboarding |
| `/partner/profile` | PartnerProfile | Perfil, datos bancarios y seguridad |
| `/partner/projects` | PartnerProjects | Lista de proyectos con filtros |
| `/partner/projects/create` | ProjectForm | Crear nuevo proyecto ESG |
| `/partner/projects/:id` | ProjectDetail | Ver detalle de proyecto |
| `/partner/projects/:id/edit` | ProjectForm | Editar proyecto existente |

## Características

### Dashboard
- ✅ Estadísticas de proyectos (total, en revisión, activos)
- ✅ Métricas de compensación (CO₂, certificados, ingresos)
- ✅ Progreso de onboarding si no está completo
- ✅ Lista de proyectos recientes
- ✅ Acciones rápidas

### Perfil
- ✅ Información de la organización (nombre, email, website)
- ✅ Gestión del logo
- ✅ Datos bancarios para pagos
- ✅ Cambio de contraseña
- ✅ Indicador de onboarding pendiente

### Proyectos
- ✅ Lista con paginación y filtros por estado
- ✅ Cards con información resumida
- ✅ Crear nuevo proyecto ESG
- ✅ Editar proyectos (solo draft o rechazados)
- ✅ Eliminar proyectos (solo draft)
- ✅ Enviar proyecto a revisión
- ✅ Ver estadísticas del proyecto

## API Endpoints Utilizados

### Profile
- `GET /partner/profile` - Obtener perfil
- `PUT /partner/profile` - Actualizar perfil
- `PUT /partner/profile/logo` - Actualizar logo
- `PUT /partner/profile/password` - Cambiar contraseña

### Onboarding
- `GET /partner/onboarding/status` - Estado del onboarding

### Bank Details
- `GET /partner/bank-details` - Obtener datos bancarios
- `PUT /partner/bank-details` - Actualizar datos bancarios

### Stats
- `GET /partner/stats` - Estadísticas generales

### Projects
- `GET /partner/projects` - Lista de proyectos
- `GET /partner/projects/:id` - Detalle de proyecto
- `POST /partner/projects` - Crear proyecto
- `PUT /partner/projects/:id` - Actualizar proyecto
- `DELETE /partner/projects/:id` - Eliminar proyecto
- `POST /partner/projects/:id/submit` - Enviar a revisión
- `GET /partner/projects/:id/stats` - Stats del proyecto

## Tipos de Proyecto Soportados

| Tipo | Label en español |
|------|------------------|
| `reforestation` | Reforestación |
| `conservation` | Conservación |
| `renewable_energy` | Energía Renovable |
| `methane_capture` | Captura de Metano |
| `ocean_cleanup` | Limpieza Oceánica |
| `sustainable_agriculture` | Agricultura Sostenible |
| `other` | Otro |

## Estados de Proyecto

| Estado | Label | Color |
|--------|-------|-------|
| `draft` | Borrador | Gris |
| `pending_review` | En Revisión | Amarillo |
| `approved` | Aprobado | Azul |
| `rejected` | Rechazado | Rojo |
| `active` | Activo | Verde |
| `paused` | Pausado | Naranja |
| `completed` | Completado | Púrpura |

## Estados de Partner

| Estado | Label | Color |
|--------|-------|-------|
| `onboarding` | En Onboarding | Amarillo |
| `active` | Activo | Verde |
| `suspended` | Suspendido | Rojo |
| `inactive` | Inactivo | Gris |

## Protección de Rutas

El módulo utiliza `ProtectedRoute` con `requiredUserTypes={['partner', 'superadmin']}`:
- Solo usuarios de tipo `partner` o `superadmin` pueden acceder
- Si el usuario no está autenticado, se redirige a `/login`
- Si el usuario es de otro tipo, se redirige a su dashboard correspondiente

## Componentes Reutilizables

### PartnerLayout
Layout completo con:
- Sidebar navegable con menú
- TopBar con título dinámico
- Indicador de notificaciones
- Acceso rápido al perfil
- Botón de logout

### StatCard
Tarjeta de estadística con:
- Título y valor
- Subtítulo opcional
- Icono personalizable
- Colores por tema (green, blue, yellow, purple, orange)

### OnboardingProgress
Banner de progreso del onboarding con:
- Porcentaje completado
- Barra de progreso
- Lista de pasos pendientes
- Botón para continuar configuración

## Uso

```tsx
// Importar rutas
import { PartnerRoutes } from './apps/partner';

// En App.tsx
<Route 
  path="/partner/*" 
  element={
    <ProtectedRoute requiredUserTypes={['partner', 'superadmin']}>
      <PartnerRoutes />
    </ProtectedRoute>
  } 
/>
```

## Dependencias

- react-router-dom (rutas)
- Shared API service (api.tsx)
- Tipos en partner.types.ts
- AuthContext para logout

## Pendiente / TODO

- [ ] Subir evidencias a proyectos
- [ ] Notificaciones en tiempo real
- [ ] Historial de cambios
- [ ] Integración con documentos PDF
- [ ] Dashboard más detallado con gráficos
