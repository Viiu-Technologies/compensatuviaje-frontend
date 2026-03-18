# Admin Partner Implementation (SuperAdmin)

## 1) Objetivo

Implementar las vistas de SuperAdmin para revisar resultados de IA de:
- Agent 2: certificacion de proyectos
- Agent 1: verificacion KYB de partners

Cuando SuperAdmin aprueba/rechaza, backend notifica al partner por email automaticamente.

---

## 2) Scope de Pantallas (Pages)

### Page A: Lista Evaluaciones IA de Proyectos (Agent 2)
- Ruta frontend sugerida: `/admin/partners/evaluations`
- Fuente principal: `GET /api/admin/partners/evaluations`
- Acciones:
  - Ver detalle de evaluacion
  - Aprobar evaluacion
  - Rechazar evaluacion

### Page B: Detalle Evaluacion IA de Proyecto (Agent 2)
- Ruta frontend sugerida: `/admin/partners/evaluations/:id`
- Fuente principal: `GET /api/admin/partners/evaluations/:id`
- Acciones:
  - `POST /api/admin/partners/evaluations/:id/approve`
  - `POST /api/admin/partners/evaluations/:id/reject`

### Page C: Lista Evaluaciones KYB (Agent 1)
- Ruta frontend sugerida: `/admin/partners/kyb-evaluations`
- Fuente principal: `GET /api/admin/partners/kyb-evaluations`
- Acciones:
  - Ver detalle KYB
  - Aprobar KYB
  - Rechazar KYB

### Page D: Detalle Evaluacion KYB (Agent 1)
- Ruta frontend sugerida: `/admin/partners/kyb-evaluations/:id`
- Fuente principal: `GET /api/admin/partners/kyb-evaluations/:id`
- Acciones:
  - `POST /api/admin/partners/kyb-evaluations/:id/approve`
  - `POST /api/admin/partners/kyb-evaluations/:id/reject`

### Page E: Drawer/Modal Contexto Partner y Proyecto
- Uso: mostrar contexto al revisor en pages B y D
- Fuentes:
  - `GET /api/admin/partners/:id`
  - `GET /api/admin/partners/projects/:id`

---

## 3) Endpoints (10 total)

Base URL:
- Dev: `http://localhost:3001`
- Base path: `/api/admin/partners`

Auth requerida:
- Header: `Authorization: Bearer <token-superadmin>`

### 3.1 Core Agent 2 (4 endpoints)

1. `GET /api/admin/partners/evaluations`
2. `GET /api/admin/partners/evaluations/:id`
3. `POST /api/admin/partners/evaluations/:id/approve`
4. `POST /api/admin/partners/evaluations/:id/reject`

### 3.2 Core Agent 1 KYB (4 endpoints)

5. `GET /api/admin/partners/kyb-evaluations`
6. `GET /api/admin/partners/kyb-evaluations/:id`
7. `POST /api/admin/partners/kyb-evaluations/:id/approve`
8. `POST /api/admin/partners/kyb-evaluations/:id/reject`

### 3.3 Contexto para UX de revision (2 endpoints)

9. `GET /api/admin/partners/:id`
10. `GET /api/admin/partners/projects/:id`

---

## 4) Queries y Contratos por Endpoint

## Endpoint 1
### GET `/api/admin/partners/evaluations`

Query params:
- `page` number (default: 1)
- `limit` number (default: 10, max: 100)
- `status` string opcional

Valores esperados para `status`:
- `ai_approved`
- `ai_rejected`
- `admin_approved`
- `admin_rejected`
- `pending`

Nota de backend:
- Si no envias `status`, backend retorna por defecto evaluaciones IA listas para revision (`ai_approved` y `ai_rejected`) con `admin_decision = null`.

Response 200:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ai_status": "ai_approved",
      "level": "ORO",
      "final_score": 87,
      "confidence_score": 92,
      "reason": "texto IA",
      "certification_type": "PDD",
      "document_name": "pdd_x.pdf",
      "created_at": "2026-03-10T16:00:00.000Z",
      "n8n_processed_at": "2026-03-10T22:15:00.000Z",
      "admin_decision": null,
      "project": {
        "id": "uuid",
        "name": "Bosque Nativo",
        "code": "NAHUEL-001",
        "projectType": "reforestation",
        "status": "active"
      },
      "partner": {
        "id": "uuid",
        "name": "EcoForest Chile",
        "contact_email": "contacto@eco.cl"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

Errores:
- `500`: `{ "success": false, "message": "Error listing evaluations" }`

## Endpoint 2
### GET `/api/admin/partners/evaluations/:id`

Path params:
- `id` UUID de evaluacion

Response 200:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "request_id": "uuid-n8n",
    "ai_status": "ai_approved",
    "certification_type": "PDD",
    "level": "ORO",
    "final_score": 87,
    "confidence_score": 92,
    "reason": "texto",
    "report_markdown": "# Reporte...",
    "project_type_detected": "Solar Energy",
    "details": {
      "scoreB": 90,
      "scoreD": 85,
      "scoreE": 86
    },
    "compliance": {
      "iso14001": true,
      "ghg_protocol": true
    },
    "document_name": "pdd_x.pdf",
    "document_url": "/uploads/certifications/...",
    "s3_key": "reports/...pdf",
    "created_at": "2026-03-10T16:00:00.000Z",
    "n8n_processed_at": "2026-03-10T22:15:00.000Z",
    "admin_decision": null,
    "admin_reason": null,
    "admin_decided_at": null,
    "admin_user": {
      "id": "uuid",
      "name": "Super Admin",
      "email": "admin@..."
    },
    "project": {
      "id": "uuid",
      "name": "Bosque Nativo",
      "code": "NAHUEL-001",
      "projectType": "reforestation",
      "status": "active",
      "description": "...",
      "country": "Chile",
      "region": "Biobio",
      "providerOrganization": "EcoForest Chile"
    },
    "partner": {
      "id": "uuid",
      "name": "EcoForest Chile",
      "contact_email": "contacto@eco.cl",
      "website_url": "https://..."
    }
  }
}
```

Errores:
- `400`: `INVALID_UUID`
- `404`: evaluacion no encontrada
- `500`: error interno

## Endpoint 3
### POST `/api/admin/partners/evaluations/:id/approve`

Path params:
- `id` UUID de evaluacion

Body:
```json
{
  "reason": "Aprobado por cumplimiento de criterios" 
}
```

`reason` es opcional.

Response 200:
```json
{
  "success": true,
  "message": "Evaluacion aprobada exitosamente",
  "data": {
    "id": "uuid",
    "admin_decision": "approved"
  }
}
```

Efecto de negocio:
- Marca evaluacion como aprobada por admin
- Si IA venia `ai_approved`, el proyecto pasa a `approved`
- Dispara email al partner

Errores:
- `400`: `INVALID_UUID` o `ALREADY_DECIDED`
- `404`: no encontrada
- `500`: error interno

## Endpoint 4
### POST `/api/admin/partners/evaluations/:id/reject`

Path params:
- `id` UUID de evaluacion

Body (obligatorio):
```json
{
  "reason": "Motivo de rechazo con minimo 10 caracteres"
}
```

Regla:
- `reason` requerido, minimo 10 chars

Response 200:
```json
{
  "success": true,
  "message": "Evaluacion rechazada",
  "data": {
    "id": "uuid",
    "admin_decision": "rejected"
  }
}
```

Efecto de negocio:
- Marca evaluacion como rechazada
- Proyecto pasa a `rejected`
- Dispara email al partner con motivo

Errores:
- `400`: `INVALID_UUID`, `VALIDATION_ERROR`, `ALREADY_DECIDED`
- `404`: no encontrada
- `500`: error interno

## Endpoint 5
### GET `/api/admin/partners/kyb-evaluations`

Query params:
- `page` number (default: 1)
- `limit` number (default: 10, max: 100)
- `status` string opcional (`ai_approved`, `ai_rejected`, `pending`)

Nota de backend:
- Si no envias `status`, retorna por defecto IA lista para revision con `admin_decision = null`.

Response 200:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ai_status": "ai_approved",
      "partner_tier": "GOLD",
      "overall_score": 85,
      "organization_name": "EcoForest Chile SpA",
      "rut_tax_id": "76.123.456-7",
      "document_name": "dossier.pdf",
      "created_at": "2026-03-10T14:30:00.000Z",
      "n8n_processed_at": "2026-03-10T18:45:00.000Z",
      "admin_decision": null,
      "partner": {
        "id": "uuid",
        "name": "EcoForest Chile",
        "contact_email": "contacto@eco.cl",
        "status": "onboarding"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

Errores:
- `500`: `{ "success": false, "message": "Error listing KYB evaluations" }`

## Endpoint 6
### GET `/api/admin/partners/kyb-evaluations/:id`

Path params:
- `id` UUID de evaluacion KYB

Response 200:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ai_status": "ai_approved",
    "partner_tier": "GOLD",
    "organization_name": "EcoForest Chile SpA",
    "rut_tax_id": "76.123.456-7",
    "scores": {
      "overall": 85,
      "legal": 90,
      "financial": 80,
      "technical": 85,
      "references": 82
    },
    "ai_insights": {
      "legal_notes": "...",
      "financial_notes": "...",
      "technical_notes": "...",
      "references_notes": "..."
    },
    "document_name": "dossier.pdf",
    "document_url": "/uploads/kyb/...",
    "s3_key": null,
    "created_at": "2026-03-10T14:30:00.000Z",
    "n8n_processed_at": "2026-03-10T18:45:00.000Z",
    "admin_decision": null,
    "admin_reason": null,
    "admin_decided_at": null,
    "admin_user": {
      "id": "uuid",
      "name": "Super Admin",
      "email": "admin@..."
    },
    "partner": {
      "id": "uuid",
      "name": "EcoForest Chile",
      "contact_email": "contacto@eco.cl",
      "website_url": "https://...",
      "status": "onboarding"
    }
  }
}
```

Errores:
- `400`: `INVALID_UUID`
- `404`: evaluacion KYB no encontrada
- `500`: error interno

## Endpoint 7
### POST `/api/admin/partners/kyb-evaluations/:id/approve`

Path params:
- `id` UUID evaluacion KYB

Body:
```json
{
  "reason": "KYB aprobado por consistencia documental"
}
```

`reason` es opcional.

Response 200:
```json
{
  "success": true,
  "message": "Evaluacion KYB aprobada exitosamente",
  "data": {
    "id": "uuid",
    "admin_decision": "approved"
  }
}
```

Efecto de negocio:
- Marca evaluacion KYB aprobada
- Si IA venia `ai_approved`, partner pasa a `active` y setea `verified_at`
- Dispara email al partner

Errores:
- `400`: `INVALID_UUID` o `ALREADY_DECIDED`
- `404`: no encontrada
- `500`: error interno

## Endpoint 8
### POST `/api/admin/partners/kyb-evaluations/:id/reject`

Path params:
- `id` UUID evaluacion KYB

Body (obligatorio):
```json
{
  "reason": "Motivo de rechazo con minimo 10 caracteres"
}
```

Response 200:
```json
{
  "success": true,
  "message": "Evaluacion KYB rechazada",
  "data": {
    "id": "uuid",
    "admin_decision": "rejected"
  }
}
```

Efecto de negocio:
- Marca evaluacion KYB rechazada
- Partner mantiene estado actual
- Dispara email al partner con motivo

Errores:
- `400`: `INVALID_UUID`, `VALIDATION_ERROR`, `ALREADY_DECIDED`
- `404`: no encontrada
- `500`: error interno

## Endpoint 9
### GET `/api/admin/partners/:id`

Uso recomendado:
- Context panel en revision KYB (datos partner, usuarios, proyectos recientes)

Path params:
- `id` UUID partner

Query params:
- No aplica

Response 200 (resumen de campos):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "EcoForest Chile",
    "contact_email": "contacto@eco.cl",
    "website_url": "https://...",
    "logo_url": null,
    "status": "active",
    "bank_details": null,
    "verified_at": "2026-03-12T10:00:00.000Z",
    "created_at": "2026-02-10T10:00:00.000Z",
    "total_projects": 3,
    "recent_projects": [],
    "users": [
      {
        "id": "uuid",
        "name": "Admin Partner",
        "email": "admin@partner.cl",
        "is_active": true,
        "last_login": "2026-03-12T08:00:00.000Z",
        "created_at": "2026-02-10T10:00:00.000Z",
        "roles": [
          { "code": "partner_admin", "name": "Partner Admin" }
        ]
      }
    ]
  }
}
```

Errores:
- `400`: `INVALID_UUID`
- `404`: partner no encontrado
- `500`: error interno

## Endpoint 10
### GET `/api/admin/partners/projects/:id`

Uso recomendado:
- Context panel en revision de certificacion (metrica, documentos, partner)

Path params:
- `id` UUID proyecto

Query params:
- No aplica

Response 200 (resumen de campos):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "NAHUEL-001",
    "name": "Bosque Nativo",
    "description": "...",
    "type": "reforestation",
    "status": "approved",
    "location_country": "Chile",
    "location_region": "Biobio",
    "provider_cost_unit_clp": 5000,
    "carbon_capture_per_unit": 0.5,
    "capacity_total": 10000,
    "capacity_sold": 7500,
    "transparency_url": "https://...",
    "created_at": "2026-01-10T10:00:00.000Z",
    "updated_at": "2026-03-12T10:00:00.000Z",
    "partner": {
      "id": "uuid",
      "name": "EcoForest Chile",
      "logo_url": null
    },
    "documents": [],
    "recent_evidence": [],
    "recent_metrics": [],
    "stats": {
      "certificates_issued": 10,
      "compensation_orders": 20,
      "capacity_remaining": 2500
    }
  }
}
```

Errores:
- `400`: `INVALID_UUID`
- `404`: project no encontrado
- `500`: error interno

---

## 5) Contrato de estados para UI (decision workflow)

Estados sugeridos de tarjeta/fila:
- `pending`: IA aun procesando (solo lectura)
- `ai_approved`: listo para decision admin
- `ai_rejected`: listo para decision admin
- `approved` (admin_decision): decision final aprobada
- `rejected` (admin_decision): decision final rechazada

Acciones permitidas en UI:
- Si `admin_decision` es `null`: mostrar botones Approve/Reject
- Si ya tiene `admin_decision`: deshabilitar acciones y mostrar quien decidio + fecha

---

## 6) Reglas frontend obligatorias

1. En `reject` exigir motivo con minimo 10 caracteres antes de enviar.
2. Manejar `ALREADY_DECIDED` como estado no editable (mostrar banner).
3. Mostrar `report_markdown` del Agent 2 renderizado en HTML (ej: react-markdown).
4. Para acciones approve/reject, refrescar detalle y lista luego de respuesta 200.
5. Usar paginacion server-side con `page` y `limit`.

---

## 7) Endpoints listos para copiar (solo URL)

1. GET `/api/admin/partners/evaluations`
2. GET `/api/admin/partners/evaluations/:id`
3. POST `/api/admin/partners/evaluations/:id/approve`
4. POST `/api/admin/partners/evaluations/:id/reject`
5. GET `/api/admin/partners/kyb-evaluations`
6. GET `/api/admin/partners/kyb-evaluations/:id`
7. POST `/api/admin/partners/kyb-evaluations/:id/approve`
8. POST `/api/admin/partners/kyb-evaluations/:id/reject`
9. GET `/api/admin/partners/:id`
10. GET `/api/admin/partners/projects/:id`
