# Arquitectura del Proyecto CompensaTuViaje

## 📁 Estructura del Proyecto

El proyecto ha sido reorganizado siguiendo una **arquitectura monolítica modular con principios de arquitectura limpia**.

```
src/
├── apps/                      # Aplicaciones modulares
│   ├── admin/                 # Módulo de administración
│   │   ├── components/        # Componentes UI de admin
│   │   ├── pages/             # Páginas/vistas de admin
│   │   ├── services/          # Lógica de negocio de admin
│   │   ├── hooks/             # Custom hooks de admin
│   │   ├── utils/             # Utilidades específicas
│   │   └── routes/            # Rutas de admin
│   │
│   ├── auth/                  # Módulo de autenticación
│   │   ├── components/        # Componentes de auth (Login, Register, etc)
│   │   ├── pages/             # Páginas de auth
│   │   ├── services/          # authService
│   │   ├── context/           # AuthContext
│   │   ├── hooks/             # Hooks de autenticación
│   │   ├── utils/             # Utilidades de auth
│   │   └── routes/            # Rutas de autenticación
│   │
│   ├── b2b/                   # Módulo B2B (Empresas)
│   │   ├── components/        # Componentes de onboarding
│   │   ├── pages/             # Páginas de onboarding
│   │   ├── services/          # onboardingService
│   │   ├── hooks/             # Hooks de B2B
│   │   ├── utils/             # Utilidades de B2B
│   │   └── routes/            # Rutas de B2B
│   │
│   ├── b2c/                   # Módulo B2C (Usuarios finales)
│   │   ├── components/        # Calculadora de carbono, compensación
│   │   ├── pages/             # Páginas de B2C
│   │   ├── services/          # Servicios de compensación
│   │   ├── hooks/             # Hooks de B2C
│   │   ├── utils/             # Utilidades de B2C
│   │   └── routes/            # Rutas de B2C
│   │
│   └── public/                # Módulo público (Landing page)
│       ├── components/        # Hero, Features, FAQ, Footer, Header
│       ├── pages/             # Landing page
│       ├── hooks/             # Hooks públicos
│       ├── utils/             # Utilidades públicas
│       └── routes/            # Rutas públicas
│
├── shared/                    # Código compartido entre apps
│   ├── components/            # Componentes reutilizables (Loading, ScrollReveal, StatsCard)
│   ├── services/              # api.js (cliente HTTP centralizado)
│   ├── utils/                 # errorHandler.js, helpers.js
│   ├── hooks/                 # Hooks compartidos
│   └── context/               # Contextos compartidos
│
├── assets/                    # Recursos estáticos
│   └── images/
│
├── App.js                     # Router principal con rutas centralizadas
├── App.css
├── index.js
└── index.css
```

## 🎯 Principios de Arquitectura

### 1. Separación por Dominio
Cada aplicación (admin, auth, b2b, b2c, public) representa un dominio de negocio independiente con sus propias responsabilidades.

### 2. Arquitectura Limpia
Cada módulo sigue capas bien definidas:
- **Components**: Capa de presentación (UI)
- **Pages**: Contenedores de páginas que usan componentes
- **Services**: Lógica de negocio y comunicación con API
- **Hooks**: Lógica reutilizable de React
- **Utils**: Funciones auxiliares
- **Routes**: Definición de rutas del módulo

### 3. Código Compartido
Todo el código reutilizable entre módulos está en `shared/`:
- Componentes UI genéricos
- Cliente HTTP (api.js)
- Utilidades comunes
- Hooks compartidos

### 4. Rutas Centralizadas
- Cada app tiene su propio archivo de rutas en `apps/[app]/routes/index.js`
- Las rutas se importan y centralizan en `src/App.js`
- Esto facilita el mantenimiento y la navegación del código

## 🔄 Flujo de Datos

```
User Interaction → Component → Hook/Service → API (shared/services/api.js) → Backend
                     ↓                           ↓
                   Context               Response Data
                     ↓                           ↓
                  Re-render ← State Update ← Processing
```

## 📦 Módulos Principales

### Admin (`apps/admin/`)
Gestión administrativa de la plataforma:
- Panel de administración
- Verificación de empresas
- Carga masiva de viajes

### Auth (`apps/auth/`)
Sistema de autenticación y autorización:
- Login/Logout
- Registro de usuarios
- Recuperación de contraseña
- Dashboard de usuario
- Gestión de sesiones (AuthContext)

### B2B (`apps/b2b/`)
Funcionalidades para empresas:
- Onboarding empresarial
- Gestión de documentos
- Estado de verificación

### B2C (`apps/b2c/`)
Funcionalidades para usuarios finales:
- Calculadora de huella de carbono
- Compensación de viajes
- Certificados

### Public (`apps/public/`)
Sitio público y landing page:
- Hero section
- Features
- Testimonials
- FAQ
- Header/Footer

## 🛠️ Servicios Compartidos

### API Service (`shared/services/api.js`)
Cliente HTTP centralizado con:
- Interceptores de request/response
- Manejo automático de tokens
- Refresh de tokens
- Manejo de errores

### Error Handler (`shared/utils/errorHandler.js`)
Gestión centralizada de errores de la aplicación.

### Helpers (`shared/utils/helpers.js`)
Funciones auxiliares reutilizables.

## 🔐 Autenticación

El sistema de autenticación está centralizado en:
- `apps/auth/context/AuthContext.js`: Context provider con estado global
- `apps/auth/services/authService.js`: Llamadas al backend
- `apps/auth/components/PrivateRoute.js`: Protección de rutas privadas
- `apps/auth/components/PublicRoute.js`: Rutas públicas (redirige si autenticado)
## 📝 Convenciones

### Nombres de Archivos
- Componentes: PascalCase (e.g., `LoginPage.js`)
- Servicios: camelCase (e.g., `authService.js`)
- Utilities: camelCase (e.g., `errorHandler.js`)
