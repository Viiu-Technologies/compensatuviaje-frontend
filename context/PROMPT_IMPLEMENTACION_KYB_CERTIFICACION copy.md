# 🤖 Prompt de Implementación Frontend - KYB + Certificación ESG

**Para:** IA Frontend Developer  
**Módulos:** Agent 1 (Verificación KYB) + Agent 2 (Certificación Proyectos ESG)  
**Prioridad:** 🔴 Crítica - Funcionalidad nueva del Portal Partner  
**Documentación de referencia:** `backend/src/modules/partner/PARTNER_FRONTEND_DOCS.md` (v2.0.0)

---

## 📋 Resumen del Trabajo

Implementar dos nuevas funcionalidades en el Portal Partner existente:

1. **Verificación Empresarial KYB (Agent 1)** — Pantalla donde el partner sube su dossier empresarial (PDF) y la IA evalúa su legitimidad con scores detallados
2. **Certificación de Proyectos ESG (Agent 2)** — Pantalla por proyecto donde el partner sube su PDD (PDF) y la IA evalúa el nivel de certificación ESG

Ambos flujos comparten el mismo patrón: **Upload → Polling → Resultados IA → Espera Admin → Decisión Final**

---

## 🏗️ Estructura de Carpetas a Crear por referencia, adecua la estrucutura a lo que ya esta creado

```
src/
├── api/
│   ├── kyb.api.ts                    # Endpoints de verificación KYB
│   └── certification.api.ts          # Endpoints de certificación ESG
│
├── hooks/
│   ├── useKyb.ts                     # Hook para estado y operaciones KYB
│   └── useCertification.ts           # Hook para estado y operaciones certificación
│
├── pages/
│   └── partner/
│       ├── KybVerificationPage.tsx    # Página completa KYB (/partner/kyb)
│       └── ProjectCertificationPage.tsx # Página certificación (/partner/projects/:id/certification)
│
├── components/
│   ├── kyb/
│   │   ├── KybUploadForm.tsx         # Formulario de subida dossier
│   │   ├── KybProcessingState.tsx    # Estado "procesando" con spinner
│   │   ├── KybResultCard.tsx         # Card con scores de IA
│   │   ├── KybScoreRadar.tsx         # Gráfico radar de 5 scores
│   │   ├── KybStatusBadge.tsx        # Badge de estado KYB
│   │   ├── KybInsightsPanel.tsx      # Panel expandible con insights de IA
│   │   └── KybHistoryTimeline.tsx    # Timeline de evaluaciones pasadas
│   │
│   ├── certification/
│   │   ├── CertUploadForm.tsx        # Formulario de subida PDD
│   │   ├── CertProcessingState.tsx   # Estado "procesando" con spinner
│   │   ├── CertResultCard.tsx        # Card con nivel + scores
│   │   ├── CertLevelBadge.tsx        # Badge circular con nivel (PLATINO/ORO/PLATA)
│   │   ├── CertScoreBreakdown.tsx    # Desglose de scoreB, scoreD, scoreE
│   │   ├── CertReportViewer.tsx      # Renderizador de report_markdown
│   │   ├── CertComplianceChecklist.tsx # Checklist de cumplimiento
│   │   └── CertHistoryTimeline.tsx   # Timeline de evaluaciones pasadas
│   │
│   └── shared/
│       ├── PdfUploader.tsx           # Componente reutilizable de upload PDF
│       ├── ScoreGauge.tsx            # Gauge visual de puntaje 0-100
│       ├── AdminPendingBanner.tsx    # Banner "Pendiente revisión admin"
│       └── EvaluationStatusBadge.tsx # Badge genérico de estado evaluación
│
├── types/
│   ├── kyb.types.ts                  # Tipos TypeScript para KYB
│   └── certification.types.ts       # Tipos TypeScript para certificación
│
└── utils/
    └── polling.ts                    # Utilidad de polling con intervalo
```

---

## 📐 Tipos TypeScript

### kyb.types.ts

```typescript
// Scores de evaluación KYB
interface KybScores {
  overall: number;
  legal: number;
  financial: number;
  technical: number;
  references: number;
}

// Insights de IA
interface KybInsights {
  legal_notes: string;
  financial_notes: string;
  technical_notes: string;
  references_notes: string;
}

// Estado posible de la evaluación KYB
type KybAiStatus = 'pending' | 'ai_approved' | 'ai_rejected' | 'error';
type AdminDecision = 'approved' | 'rejected' | null;
type PartnerTier = 'PLATINUM' | 'GOLD' | 'SILVER' | null;

// Evaluación KYB completa
interface KybEvaluation {
  id: string;
  ai_status: KybAiStatus;
  partner_tier: PartnerTier;
  document_name: string;
  document_url?: string;
  organization_name: string;
  rut_tax_id?: string;
  scores: KybScores | null;
  ai_insights: KybInsights | null;
  s3_key: string | null;
  admin_decision: AdminDecision;
  admin_reason: string | null;
  admin_decided_at: string | null;
  created_at: string;
  n8n_processed_at: string | null;
}

// Respuesta de estado KYB
interface KybStatusResponse {
  partner: {
    id: string;
    name: string;
    status: string;
  };
  has_evaluation: boolean;
  latest_evaluation: KybEvaluation | null;
}

// Respuesta de historial KYB
interface KybHistoryResponse {
  partner: {
    id: string;
    name: string;
  };
  evaluations: Array<KybEvaluation & { overall_score: number }>;
  total: number;
}

// Respuesta de upload KYB
interface KybUploadResponse {
  id: string;
  status: string;
  document_name: string;
  organization_name: string;
  created_at: string;
}
```

### certification.types.ts

```typescript
// Tipos de certificación
type CertificationType = 'PDD' | 'VVB' | 'Gold Standard' | 'VCS';

// Niveles de certificación ESG
type CertificationLevel = 'PLATINO IMPACTO' | 'ORO' | 'PLATA' | null;

// Estado IA de certificación
type CertAiStatus = 'pending' | 'ai_approved' | 'ai_rejected' | 'error';

// Desglose de puntajes
interface CertScoreDetails {
  scoreB: number; // Biodiversidad
  scoreD: number; // Desarrollo social
  scoreE: number; // Estándares ambientales
}

// Cumplimiento normativo
interface CertCompliance {
  iso14001?: boolean;
  ghg_protocol?: boolean;
  [key: string]: boolean | undefined;
}

// Evaluación de certificación completa
interface CertificationEvaluation {
  id: string;
  status: CertAiStatus;
  certification_type: CertificationType;
  level: CertificationLevel;
  final_score: number | null;
  confidence_score: number | null;
  reason: string | null;
  project_type_detected: string | null;
  document_name: string;
  document_url?: string;
  request_id?: string;
  details: CertScoreDetails | null;
  compliance: CertCompliance | null;
  report_markdown: string | null;
  s3_key: string | null;
  admin_decision: AdminDecision;
  admin_reason: string | null;
  admin_decided_at: string | null;
  created_at: string;
  n8n_processed_at: string | null;
  project?: {
    id: string;
    name: string;
    code: string;
    status: string;
    projectType: string;
  };
}

// Respuesta de estado certificación
interface CertStatusResponse {
  project: {
    id: string;
    name: string;
    status: string;
  };
  has_evaluation: boolean;
  latest_evaluation: CertificationEvaluation | null;
}

// Respuesta de upload certificación
interface CertUploadResponse {
  id: string;
  status: string;
  certification_type: CertificationType;
  document_name: string;
  created_at: string;
}

// Respuesta de historial certificación
interface CertHistoryResponse {
  project: {
    id: string;
    name: string;
  };
  evaluations: CertificationEvaluation[];
}
```

---

## 📡 API Layer

### kyb.api.ts

```typescript
import { apiClient } from './client';

export const kybApi = {
  // Subir dossier empresarial para evaluación KYB
  upload: (formData: FormData) =>
    apiClient.post('/api/partner/kyb', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Obtener estado actual de verificación KYB
  getStatus: () =>
    apiClient.get('/api/partner/kyb/status'),

  // Obtener detalle de una evaluación específica
  getDetail: (evalId: string) =>
    apiClient.get(`/api/partner/kyb/${evalId}`),

  // Obtener historial de evaluaciones
  getHistory: () =>
    apiClient.get('/api/partner/kyb/history'),
};
```

### certification.api.ts

```typescript
import { apiClient } from './client';

export const certificationApi = {
  // Subir PDD para evaluación de certificación
  upload: (projectId: string, formData: FormData) =>
    apiClient.post(`/api/partner/projects/${projectId}/certification`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Obtener estado de certificación del proyecto
  getStatus: (projectId: string) =>
    apiClient.get(`/api/partner/projects/${projectId}/certification/status`),

  // Obtener detalle de una evaluación específica
  getDetail: (projectId: string, evalId: string) =>
    apiClient.get(`/api/partner/projects/${projectId}/certification/${evalId}`),

  // Obtener historial de certificaciones del proyecto
  getHistory: (projectId: string) =>
    apiClient.get(`/api/partner/projects/${projectId}/certification/history`),
};
```

---

## 📱 Páginas a Implementar

### 1. Verificación KYB (`/partner/kyb`)

**Ruta:** `/partner/kyb`  
**Componente:** `KybVerificationPage.tsx`  
**Acceso:** Partner autenticado  
**Navegación:** Link en sidebar → "Verificación Empresarial" con ícono 🏢

#### Comportamiento según estado

La página tiene **5 estados visuales** determinados por la respuesta de `GET /api/partner/kyb/status`:

**Estado 1: Sin evaluación** (`has_evaluation === false`)
```
┌────────────────────────────────────────────────────────┐
│ 🏢 Verificación Empresarial KYB                       │
│                                                        │
│ Para operar como partner certificado, necesitas        │
│ completar la verificación de tu empresa.               │
│                                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Nombre de empresa: [EcoForest Chile SpA     ]    │   │
│ │ RUT tributario:    [76.123.456-7            ]    │   │
│ │                                                  │   │
│ │ 📎 [Arrastra tu dossier empresarial aquí]        │   │
│ │     o haz clic para seleccionar (PDF, máx 10MB)  │   │
│ │                                                  │   │
│ │ [    Enviar para Verificación    ]               │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ ℹ️ La IA evaluará: legal, financiero, técnico,         │
│    referencias (5-15 minutos)                          │
└────────────────────────────────────────────────────────┘
```

**Estado 2: Procesando** (`ai_status === 'pending'`)
```
┌────────────────────────────────────────────────────────┐
│ 🏢 Verificación Empresarial KYB                       │
│                                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │ ⏳ Evaluación en Proceso                         │   │
│ │                                                  │   │
│ │ [====== spinner ========]                        │   │
│ │                                                  │   │
│ │ Nuestra IA está analizando tu dossier            │   │
│ │ empresarial. Esto puede tomar 5-15 minutos.      │   │
│ │                                                  │   │
│ │ 📄 documentos_ecoforest_2026.pdf                 │   │
│ │ 🕐 Enviado: 10 Mar 2026, 14:30                  │   │
│ └──────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```
> **Polling:** Cada 30 segundos hacer `GET /api/partner/kyb/status` hasta que `ai_status !== 'pending'`

**Estado 3: IA Completó** (`ai_status === 'ai_approved' | 'ai_rejected'` y `admin_decision === null`)
```
┌────────────────────────────────────────────────────────┐
│ 🏢 Verificación Empresarial KYB                       │
│                                                        │
│ ⚠️ Pendiente revisión del administrador                │
│                                                        │
│ ┌── Score General ──────────────────────────────────┐  │
│ │  85/100  Tier: 🥇 GOLD                           │  │
│ │                                                   │  │
│ │  [Gráfico Radar]                                  │  │
│ │  Legal: 90  Financial: 80  Technical: 85          │  │
│ │  References: 82                                   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                        │
│ ┌── Insights de IA ─────────────────────────────────┐  │
│ │ 📋 Legal: Documentación legal en regla...          │  │
│ │ 💰 Financiero: Estados financieros sólidos...      │  │
│ │ 🔧 Técnico: Equipo calificado...                   │  │
│ │ 📞 Referencias: 4 verificadas positivamente...     │  │
│ └───────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Estado 4: Admin Aprobó** (`admin_decision === 'approved'`)
```
┌────────────────────────────────────────────────────────┐
│ 🏢 Verificación Empresarial KYB                       │
│                                                        │
│ ✅ Empresa Verificada — Tier: 🥇 GOLD                 │
│                                                        │
│ Tu empresa ha sido verificada exitosamente.            │
│ Puedes operar como partner certificado.                │
│                                                        │
│ (Mostrar scores + insights de IA como referencia)      │
│                                                        │
│ [Ver Historial de Evaluaciones]                        │
└────────────────────────────────────────────────────────┘
```

**Estado 5: Admin Rechazó** (`admin_decision === 'rejected'`)
```
┌────────────────────────────────────────────────────────┐
│ 🏢 Verificación Empresarial KYB                       │
│                                                        │
│ ❌ Verificación Rechazada                              │
│                                                        │
│ Motivo del administrador:                              │
│ "Documentación financiera insuficiente..."             │
│                                                        │
│ (Mostrar scores + insights para referencia)            │
│                                                        │
│ [📎 Volver a Enviar Dossier]  [Ver Historial]         │
└────────────────────────────────────────────────────────┘
```

#### Validaciones Frontend KYB
- `organizationName`: requerido, mínimo 3 caracteres
- `rutTaxId`: requerido, formato RUT chileno (XX.XXX.XXX-X)
- `file`: requerido, solo PDF, máximo 10MB
- Deshabilitar botón submit si hay evaluación `pending` activa

---

### 2. Certificación de Proyecto (`/partner/projects/:id/certification`)

**Ruta:** `/partner/projects/:id/certification`  
**Componente:** `ProjectCertificationPage.tsx`  
**Acceso:** Partner autenticado, dueño del proyecto  
**Navegación:** Botón "Certificar Proyecto" dentro del detalle de cada proyecto

#### Comportamiento según estado

La página tiene **4 estados visuales** determinados por `GET /api/partner/projects/:id/certification/status`:

**Estado 1: Sin evaluación** (`has_evaluation === false`)
```
┌────────────────────────────────────────────────────────┐
│ 📜 Certificación ESG — Bosque Nativo Nahuelbuta        │
│                                                        │
│ Somete tu proyecto a evaluación ESG para obtener       │
│ certificación ambiental.                                │
│                                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Tipo de certificación:                           │   │
│ │ [▼ PDD / VVB / Gold Standard / VCS ]             │   │
│ │                                                  │   │
│ │ 📎 [Arrastra tu documento PDD aquí]              │   │
│ │     o haz clic para seleccionar (PDF, máx 10MB)  │   │
│ │                                                  │   │
│ │ [    Enviar para Certificación    ]              │   │
│ └──────────────────────────────────────────────────┘   │
│                                                        │
│ 📊 Niveles de certificación:                           │
│ PLATINO IMPACTO (≥90) | ORO (70-89) | PLATA (50-69)   │
└────────────────────────────────────────────────────────┘
```

**Estado 2: IA Completó** (`status === 'ai_approved' | 'ai_rejected'` y `admin_decision === null`)
```
┌────────────────────────────────────────────────────────┐
│ 📜 Certificación ESG — Bosque Nativo Nahuelbuta        │
│                                                        │
│ ⚠️ Pendiente revisión del administrador                │
│                                                        │
│ ┌── Resultado ──────────────────────────────────────┐  │
│ │ Nivel: 🥇 ORO        Score: 87/100               │  │
│ │ Confianza: 92%        Tipo: PDD                   │  │
│ │                                                   │  │
│ │ Puntajes:                                         │  │
│ │  Biodiversidad (scoreB):    90/100  ████████░░    │  │
│ │  Desarrollo Social (scoreD): 85/100 ████████░░    │  │
│ │  Estándares Amb. (scoreE):  86/100  ████████░░    │  │
│ │                                                   │  │
│ │ Cumplimiento:                                     │  │
│ │  ✅ ISO 14001    ✅ GHG Protocol                   │  │
│ └───────────────────────────────────────────────────┘  │
│                                                        │
│ ┌── Reporte de IA ──────────────────────────────────┐  │
│ │ # Reporte de Evaluación ESG                       │  │
│ │ ## Resumen Ejecutivo                              │  │
│ │ El proyecto muestra un alto nivel de impacto...   │  │
│ │ [... renderizado Markdown completo ...]           │  │
│ └───────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```
> **IMPORTANTE:** El campo `report_markdown` contiene Markdown completo. Usar `react-markdown` o `marked` para renderizar.

**Estado 3: Admin Aprobó** (`admin_decision === 'approved'`)
```
┌────────────────────────────────────────────────────────┐
│ 📜 Certificación ESG — Bosque Nativo Nahuelbuta        │
│                                                        │
│ ✅ Proyecto Certificado — Nivel: 🥇 ORO               │
│                                                        │
│ (Mostrar scores + reporte + cumplimiento)              │
│                                                        │
│ [Descargar Certificado]  [Ver Historial]               │
└────────────────────────────────────────────────────────┘
```

**Estado 4: Admin Rechazó** (`admin_decision === 'rejected'`)
```
┌────────────────────────────────────────────────────────┐
│ 📜 Certificación ESG — Bosque Nativo Nahuelbuta        │
│                                                        │
│ ❌ Certificación Rechazada                             │
│                                                        │
│ Motivo: "Documentación de línea base insuficiente"     │
│                                                        │
│ (Mostrar scores + reporte para referencia)             │
│                                                        │
│ [📎 Volver a Enviar PDD]  [Ver Historial]              │
└────────────────────────────────────────────────────────┘
```

#### Validaciones Frontend Certificación
- `certificationType`: requerido, uno de ['PDD', 'VVB', 'Gold Standard', 'VCS']
- `file`: requerido, solo PDF, máximo 10MB
- Deshabilitar botón submit si hay evaluación `pending` activa para este proyecto
- Solo mostrar botón "Certificar" si el partner es dueño del proyecto

---

## 🔄 Patrón de Polling (Compartido)

Ambos flujos necesitan polling mientras el estado es `pending`:

```typescript
// utils/polling.ts
export function usePolling(
  fetchFn: () => Promise<any>,
  shouldContinue: (data: any) => boolean,
  intervalMs: number = 30000
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let cancelled = false;

    const poll = async () => {
      try {
        const result = await fetchFn();
        if (!cancelled) {
          setData(result);
          setLoading(false);
          if (shouldContinue(result)) {
            timer = setTimeout(poll, intervalMs);
          }
        }
      } catch (error) {
        if (!cancelled) setLoading(false);
      }
    };

    poll();
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  return { data, loading };
}

// Uso en KYB:
const { data: kybStatus } = usePolling(
  () => kybApi.getStatus(),
  (res) => res.data.latest_evaluation?.ai_status === 'pending',
  30000
);

// Uso en Certificación:
const { data: certStatus } = usePolling(
  () => certificationApi.getStatus(projectId),
  (res) => res.data.latest_evaluation?.status === 'pending',
  30000
);
```

---

## 🎨 Componentes Clave

### PdfUploader (Componente Reutilizable)

```typescript
interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;       // Default: 10
  disabled?: boolean;
  isUploading?: boolean;
  currentFileName?: string;  // Mostrar nombre si ya hay archivo
}
```

Comportamiento:
- Zona de drag & drop con borde punteado
- Validar tipo MIME: `application/pdf`
- Validar tamaño < 10MB
- Mostrar preview del nombre del archivo seleccionado
- Mostrar barra de progreso durante upload
- Mostrar error si tipo/tamaño inválido

### ScoreGauge (Gauge Visual)

```typescript
interface ScoreGaugeProps {
  score: number;        // 0-100
  label: string;        // "Legal", "Financiero", etc.
  size?: 'sm' | 'md' | 'lg';
  colorThresholds?: {   // Default: verde ≥70, amarillo ≥50, rojo <50
    green: number;
    yellow: number;
  };
}
```

### KybScoreRadar (Gráfico Radar para KYB)

Mostrar los 5 scores KYB en un gráfico radar/pentagon:
- Legal (90)
- Financial (80)
- Technical (85)
- References (82)
- Overall (85) al centro

Usar librería: `recharts` (RadarChart) o `chart.js` (Radar)

### CertLevelBadge (Badge de Nivel Certificación)

```typescript
interface CertLevelBadgeProps {
  level: CertificationLevel;
  score: number;
}
```

Colores y estilos:
| Nivel | Color | Ícono |
|-------|-------|-------|
| PLATINO IMPACTO | `bg-purple-100 text-purple-800` | 💎 |
| ORO | `bg-yellow-100 text-yellow-800` | 🥇 |
| PLATA | `bg-gray-100 text-gray-600` | 🥈 |
| RECHAZADO | `bg-red-100 text-red-800` | ❌ |

### CertReportViewer (Renderizador de Markdown)

```typescript
interface CertReportViewerProps {
  markdown: string;      // report_markdown completo
  maxHeight?: string;    // Default: '500px', con scroll
}
```

- Instalar `react-markdown` para renderizar
- Aplicar estilos de prosa con `@tailwindcss/typography` o estilos custom
- Scroll vertical si el reporte es largo
- Botón "Expandir" para ver completo

### AdminPendingBanner

```typescript
// Mostrar cuando ai_status != 'pending' pero admin_decision === null
<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
  <span className="text-amber-800">
    ⚠️ Evaluación de IA completada. Pendiente revisión del administrador.
  </span>
</div>
```

---

## 🧭 Navegación

### Sidebar del Partner — Agregar items

```
📊 Dashboard
👤 Perfil
🏗️ Proyectos
🏢 Verificación KYB    ← NUEVO (con badge de estado)
📜 (dentro de cada proyecto → botón "Certificar")
```

### Badge en Sidebar para KYB

El item "Verificación KYB" del sidebar debe mostrar un badge/dot según estado:
- 🔴 Sin verificar (no hay evaluación)
- 🟡 En proceso (pending)
- 🟠 Pendiente admin (IA completó, admin no decidió)
- 🟢 Verificado (admin approved)
- 🔴 Rechazado (admin rejected)

### Botón "Certificar" en Detalle de Proyecto

En la página de detalle de cada proyecto (`/partner/projects/:id`), agregar un botón/sección:
- Si NO hay evaluación: Botón "📜 Certificar Proyecto"
- Si hay evaluación pending: Badge "⏳ Certificación en proceso"
- Si IA completó: Badge "📊 Ver Resultados Certificación"
- Si admin aprobó: Badge "✅ Certificado — Nivel: ORO"
- Si admin rechazó: Botón "🔄 Re-certificar Proyecto"

---

## 🔗 Integración con Dashboard

En el dashboard principal del partner (`/partner/dashboard`), agregar un card de estado KYB:

```
┌── Estado KYB ─────────────────────┐
│ 🏢 Verificación Empresarial       │
│                                    │
│ Estado: 🟢 Verificado (GOLD)      │
│ Score: 85/100                      │
│                                    │
│ [Ver Detalle →]                    │
└────────────────────────────────────┘
```

Si no está verificado:
```
┌── Estado KYB ─────────────────────┐
│ 🏢 Verificación Empresarial       │
│                                    │
│ ⚠️ No verificado                   │
│ Completa tu verificación KYB       │
│ para operar como partner.          │
│                                    │
│ [Iniciar Verificación →]           │
└────────────────────────────────────┘
```

---

## ⚠️ Manejo de Errores

### Errores HTTP a manejar

| Código | Endpoint | Acción en UI |
|--------|----------|-------------|
| 400 | POST upload | Mostrar mensaje de validación específico |
| 404 | GET cualquiera | "No se encontró la evaluación" o "Proyecto no encontrado" |
| 409 | POST upload | Mostrar "Ya existe una evaluación en proceso. Espera a que finalice." y deshabilitar formulario |
| 401 | cualquiera | Redirigir a login (token expirado) |
| 500 | cualquiera | "Error del servidor. Intenta nuevamente." |

### Manejo de 409 (evaluación en proceso)

Cuando el backend retorna 409, es porque ya hay una evaluación `pending`. El frontend debe:
1. Mostrar toast/alert con el mensaje del backend
2. Deshabilitar el formulario de upload
3. Cambiar al estado "Procesando" con polling activo

---

## 📏 Reglas de Negocio en Frontend

1. **KYB es por Partner** — Un solo formulario KYB para toda la empresa (no por proyecto)
2. **Certificación es por Proyecto** — Cada proyecto tiene su propia certificación
3. **No se puede subir si hay pending** — Validar antes de mostrar el formulario
4. **Re-subida solo si rejected** — Mostrar formulario de re-subida solo cuando `admin_decision === 'rejected'`
5. **Admin necesario** — Un resultado `ai_approved` NO es aprobación final; siempre mostrar "Pendiente revisión admin"
6. **Scores son de solo lectura** — El partner no puede modificar los scores/insights de la IA
7. **Report Markdown** — Solo en certificación; renderizar como HTML (no en KYB)

---

## 🔐 Rutas Protegidas

Agregar a las rutas del partner router:

```typescript
// Nuevas rutas
{ path: '/partner/kyb', component: KybVerificationPage },
{ path: '/partner/projects/:id/certification', component: ProjectCertificationPage },
```

Ambas rutas requieren autenticación como Partner (`is_partner: true`).

---

## 📦 Dependencias a Instalar

```bash
npm install react-markdown            # Renderizar report_markdown
npm install recharts                   # Gráficos radar para KYB scores (si no está)
npm install @tailwindcss/typography   # Estilos prose para markdown (si usa Tailwind)
```

---

## ✅ Checklist de Implementación

### KYB (Agent 1)
- [ ] Crear `kyb.api.ts` con 4 endpoints
- [ ] Crear `kyb.types.ts` con tipos TypeScript
- [ ] Crear `KybVerificationPage.tsx` con 5 estados visuales
- [ ] Crear `KybUploadForm.tsx` con validación de PDF/RUT
- [ ] Crear `KybProcessingState.tsx` con polling cada 30s
- [ ] Crear `KybResultCard.tsx` con scores + tier
- [ ] Crear `KybScoreRadar.tsx` con gráfico radar de 5 dimensiones
- [ ] Crear `KybInsightsPanel.tsx` con notas expandibles
- [ ] Crear `KybStatusBadge.tsx` para sidebar y dashboard
- [ ] Crear `KybHistoryTimeline.tsx` para evaluaciones pasadas
- [ ] Agregar "Verificación KYB" al sidebar con badge
- [ ] Agregar card KYB al dashboard principal
- [ ] Manejar error 409 (evaluación en proceso)

### Certificación (Agent 2)
- [ ] Crear `certification.api.ts` con 4 endpoints
- [ ] Crear `certification.types.ts` con tipos TypeScript
- [ ] Crear `ProjectCertificationPage.tsx` con 4 estados visuales
- [ ] Crear `CertUploadForm.tsx` con select de tipo + PDF
- [ ] Crear `CertProcessingState.tsx` con polling cada 30s
- [ ] Crear `CertResultCard.tsx` con nivel + scores
- [ ] Crear `CertLevelBadge.tsx` con colores por nivel
- [ ] Crear `CertScoreBreakdown.tsx` con barras de progreso
- [ ] Crear `CertReportViewer.tsx` con react-markdown
- [ ] Crear `CertComplianceChecklist.tsx` con checkmarks
- [ ] Crear `CertHistoryTimeline.tsx` para evaluaciones pasadas
- [ ] Agregar botón "Certificar" en detalle de proyecto
- [ ] Manejar error 409 (evaluación en proceso)

### Compartidos
- [ ] Crear `PdfUploader.tsx` reutilizable
- [ ] Crear `ScoreGauge.tsx` reutilizable
- [ ] Crear `AdminPendingBanner.tsx`
- [ ] Crear `EvaluationStatusBadge.tsx`
- [ ] Implementar `usePolling` hook
- [ ] Agregar rutas protegidas al router

---

> **Documento generado para la IA Frontend Developer**  
> **CompensaTuViaje - Portal Partner ESG**  
> **Marzo 2026 - Módulos KYB (Agent 1) + Certificación (Agent 2)**
