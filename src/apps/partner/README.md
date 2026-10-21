# Módulo Partner - Frontend

## Descripción

El módulo Partner es el portal de las organizaciones ESG que ofrecen proyectos
de compensación en CompensaTuViaje. Desde aquí el partner completa su perfil,
pasa la verificación KYB, crea proyectos, los certifica y, cada mes, sube la
evidencia de lo entregado para liberar su pago y pedir stock nuevo.

## Flujo del partner

1. **Perfil.** Completa los datos de la organización, el logo y los datos
   bancarios. Hasta entonces solo ve el Resumen y Mi perfil.
2. **Verificación KYB (Agente 1).** Sube su dossier legal y financiero en PDF.
   Gemini lo evalúa y propone un puntaje y un tier (Platino, Oro o Plata); un
   admin toma la decisión final. Sin KYB aprobado, Mis proyectos queda
   bloqueado.
3. **Proyectos.** Crea el proyecto en borrador, lo edita y lo envía a revisión.
4. **Certificación del proyecto (Agente 2, Veritas AI).** Sube el documento
   técnico del proyecto. La IA lo audita en tres pilares (ambiental,
   adicionalidad y medición) y propone un nivel (Platino Impacto, Oro o
   Plata); un admin decide.
5. **Reposición mensual de stock.** Con el proyecto activo, sube la evidencia
   de las unidades entregadas en el mes. Al aprobarla, el admin libera el pago
   retenido y habilita el stock del mes siguiente.

### Doble candado de navegación

`PartnerLayout` bloquea secciones según el estado del partner, tanto en el menú
como al entrar por URL:

| Estado | Puede entrar a | Si entra por URL a otra sección |
|---|---|---|
| Perfil incompleto | Resumen, Mi perfil | Redirige a `/partner/profile` |
| Perfil completo, KYB sin aprobar | Lo anterior + Verificación KYB | Redirige a `/partner/kyb` |
| KYB aprobado por el admin | Todo | — |

"Perfil completo" es `onboarding.completed === true`; "KYB aprobado" es
`admin_decision === 'approved'` en la última evaluación KYB.

## Estructura de Archivos

```
src/apps/partner/
├── index.ts                         # Exportaciones del módulo
├── components/
│   ├── PartnerLayout.tsx            # Barra lateral, cabecera y doble candado
│   └── shared/PdfUploader.tsx       # Subida de PDF con arrastrar y soltar
├── context/
│   └── PartnerContext.tsx           # Estado compartido: perfil, onboarding y KYB
├── hooks/
│   └── usePolling.ts                # Consulta periódica mientras la IA evalúa
├── pages/
│   ├── PartnerDashboard.tsx         # Resumen
│   ├── PartnerProfile.tsx           # Perfil, logo, datos bancarios y contraseña
│   ├── KybVerificationPage.tsx      # Dossier KYB, resultado e historial
│   ├── PartnerProjects.tsx          # Lista de proyectos
│   ├── ProjectDetail.tsx            # Detalle de proyecto
│   ├── ProjectForm.tsx              # Crear/Editar proyecto
│   ├── ProjectCertificationPage.tsx # Certificación del proyecto
│   └── MonthlyRestockPage.tsx       # Evidencia mensual y stock nuevo
├── routes/
│   └── PartnerRoutes.tsx            # Configuración de rutas
├── services/
│   ├── partnerApi.ts                # Perfil, onboarding, banco, stats y proyectos
│   ├── kybApi.ts                    # Verificación KYB
│   ├── certificationApi.ts          # Certificación de proyectos
│   └── evidenceApi.ts               # Archivos y evidencia mensual (R2)
└── ui/
    └── index.tsx                    # Kit del portal (reutiliza el de B2C)

src/types/
├── partner.types.ts                 # Partner y proyectos
├── kyb.types.ts                     # Evaluaciones KYB y tiers
└── certification.types.ts           # Evaluaciones de certificación y niveles
```

## Rutas Disponibles

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/partner` | PartnerDashboard | Resumen con estadísticas y onboarding |
| `/partner/profile` | PartnerProfile | Perfil, logo, datos bancarios y contraseña |
| `/partner/kyb` | KybVerificationPage | Subir dossier KYB y ver el resultado |
| `/partner/projects` | PartnerProjects | Lista de proyectos con filtros |
| `/partner/projects/create` | ProjectForm | Crear nuevo proyecto ESG |
| `/partner/projects/:id` | ProjectDetail | Detalle de proyecto |
| `/partner/projects/:id/edit` | ProjectForm | Editar proyecto existente |
| `/partner/projects/:id/certification` | ProjectCertificationPage | Certificar el proyecto |
| `/partner/projects/:id/restock` | MonthlyRestockPage | Evidencia mensual y stock nuevo |

Cualquier otra ruta bajo `/partner` redirige a `/partner`.

## Características

### Resumen
- Estadísticas de proyectos (total, en revisión, activos)
- Métricas de compensación (CO₂, certificados, ingresos)
- Progreso de onboarding si no está completo
- Proyectos recientes y acciones rápidas

### Perfil
- Información de la organización (nombre, email, sitio web)
- Logo
- Datos bancarios para pagos
- Cambio de contraseña

### Verificación KYB
- Subida del dossier en PDF
- Estado mientras la IA evalúa (consulta cada 30 s)
- Puntajes por área: legal, financiero, técnico y referencias, con notas
- Tier propuesto y recomendación de la IA
- Decisión del admin e historial de evaluaciones

### Proyectos
- Lista con paginación y filtros por estado
- Crear, editar (solo borrador o rechazado) y eliminar (solo borrador)
- Enviar a revisión
- Estadísticas del proyecto (vienen en el detalle, no hay endpoint aparte)

### Certificación de proyecto
- Subida del documento técnico en PDF
- Estado mientras la IA audita (consulta cada 30 s)
- Nivel propuesto, decisión del admin e historial

### Reposición mensual
- Unidades entregadas, stock solicitado y nota opcional
- Uno o más archivos de evidencia (hasta 120 s de subida)
- Stock aprobado y restante del mes

## Estado compartido y polling

`PartnerContext` es la única fuente de verdad para `profile`, `onboarding` y
`kybStatus`. Cualquier página llama a `refetch()` después de completar un paso,
y el layout (dueño del doble candado) se entera sin recargar. Mientras el KYB
no esté en un estado final, el contexto consulta cada 30 s y también al
recuperar el foco de la ventana, así detecta cuando un admin lo aprueba o
rechaza.

`usePolling` es el hook genérico que usan KYB y Certificación para consultar el
backend mientras la evaluación de la IA está pendiente.

## API Endpoints Utilizados

### Perfil
- `GET /partner/profile` - Obtener perfil
- `PUT /partner/profile` - Actualizar perfil
- `PUT /partner/profile/logo` - Actualizar logo
- `PUT /partner/password` - Cambiar contraseña

### Onboarding
- `GET /partner/onboarding/status` - Estado del onboarding

### Datos bancarios
- `GET /partner/profile/bank-details` - Obtener datos bancarios
- `PUT /partner/profile/bank-details` - Actualizar datos bancarios

### Estadísticas
- `GET /partner/stats` - Estadísticas generales

### KYB
- `POST /partner/kyb` - Subir dossier (multipart)
- `GET /partner/kyb/status` - Estado y última evaluación
- `GET /partner/kyb/:evalId` - Detalle de una evaluación
- `GET /partner/kyb/history` - Historial de evaluaciones

### Proyectos
- `GET /partner/projects` - Lista de proyectos
- `GET /partner/projects/:id` - Detalle de proyecto (incluye estadísticas)
- `POST /partner/projects` - Crear proyecto
- `PUT /partner/projects/:id` - Actualizar proyecto
- `DELETE /partner/projects/:id` - Eliminar proyecto
- `POST /partner/projects/:id/submit` - Enviar a revisión

### Certificación
- `POST /partner/projects/:id/certification` - Subir documento técnico
- `GET /partner/projects/:id/certification/status` - Estado y última evaluación
- `GET /partner/projects/:id/certification/:evalId` - Detalle de una evaluación
- `GET /partner/projects/:id/certification/history` - Historial

### Archivos y evidencia
- `POST /partner/projects/:id/files` - Archivos iniciales (fotos y documentos)
- `POST /partner/projects/:id/evidence` - Evidencia mensual (multipart)
- `GET /partner/projects/:id/evidence` - Evidencia del proyecto

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

## Estados de una evaluación (KYB y certificación)

| Estado de la IA | Significa |
|---|---|
| `pending` | La IA está evaluando; la página consulta cada 30 s |
| `ai_approved` / `ai_rejected` | La IA terminó y recomienda aprobar o rechazar; falta el admin |
| `error` | La evaluación falló. En KYB se reenvía desde la misma página; en certificación, editando el proyecto |

La decisión final es `admin_decision`: `approved`, `rejected` o `null` mientras
el admin no decide.

## Protección de Rutas

En `App.tsx` el módulo se carga con `lazy` y se envuelve en `ProtectedRoute` con
`requiredUserTypes={['partner', 'superadmin']}`:
- Solo usuarios de tipo `partner` o `superadmin` pueden acceder
- Si el usuario no está autenticado, se redirige a `/login`
- Si el usuario es de otro tipo, se redirige a su dashboard correspondiente

Dentro del módulo, el doble candado de `PartnerLayout` limita además qué
secciones se pueden abrir.

## Kit de UI

`ui/index.tsx` reexporta el kit del área B2C (tarjetas, botones, cifras,
etiquetas) para que las tres áreas se vean iguales, y suma lo propio del
portal: `PageHeader`, `Field` (campo de solo lectura), `ProjectStatusBadge`,
`ScoreTile` y `scoreTone` para los puntajes de la IA.

## Uso

```tsx
// En App.tsx
const PartnerRoutes = lazy(() =>
  import('./apps/partner').then(m => ({ default: m.PartnerRoutes }))
);

<Route
  path="/partner/*"
  element={
    <ProtectedRoute requiredUserTypes={['partner', 'superadmin']}>
      <PartnerRoutes />
    </ProtectedRoute>
  }
/>
```

`PartnerRoutes` ya incluye el `PartnerProvider`; no hace falta envolverlo.

## Dependencias

- react-router-dom (rutas)
- Servicio compartido de API (`src/shared/services/api.tsx`)
- Tipos en `partner.types.ts`, `kyb.types.ts` y `certification.types.ts`
- AuthContext para logout

## Pendiente

- Liquidaciones: el partner no ve lo que se le debe ni lo pagado (el backend
  tiene el código, pero sin rutas; tarea CTV-20 del backlog)
- Notificaciones en tiempo real
- Historial de cambios del proyecto
- Gráficos en el resumen
