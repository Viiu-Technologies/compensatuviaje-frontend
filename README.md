# CompensaTuViaje · Frontend

Sitio y paneles de CompensaTuViaje: la landing con la calculadora pública de
huella de vuelos, y los paneles de personas (B2C), empresas (B2B), partners y
administración.

**Stack:** React 19, Vite 7, TypeScript, Tailwind CSS 4 y React Router 7.

Necesita el backend corriendo:
[Compensatuviaje-backend](https://github.com/Viiu-Technologies/Compensatuviaje-backend).

## Arrancar en local

Con el backend ya corriendo en `http://localhost:3002`:

```bash
git switch develop
corepack enable && pnpm install
cp .env.example .env     # apunta al backend local
pnpm dev                 # http://localhost:3000
```

- En `http://localhost:3000/login` aparece el recuadro **"Entorno local de
  pruebas"** para entrar con cada perfil sin Google.
- Los pasos completos y los comandos están en
  [CONTRIBUTING.md](CONTRIBUTING.md).
- **No subas tu `.env`:** todo lo que empieza con `VITE_` termina en el
  navegador, y lo secreto va en el backend.

## Estructura

```
src/
├── App.tsx            # rutas de toda la app
├── apps/
│   ├── public/        # landing, calculadora, blog y noticias, contacto, páginas legales
│   ├── auth/          # login, registro y protección de rutas
│   ├── b2c/           # panel de personas
│   ├── b2b/           # panel de empresas
│   ├── partner/       # portal de partners (ver su README)
│   └── admin/         # panel del superadmin
├── shared/            # clientes de la API, componentes y utilidades comunes
├── config/            # variables de entorno
└── types/             # tipos de TypeScript compartidos
```

## Cómo contribuir

- Todo el trabajo entra a **`develop`** por Pull Request. `main` es producción.
- Una rama por tarea del backlog de Notion: `feat/CTV-2-buscador-aeropuertos`.
- PR chicos, con la plantilla completa y el CI en verde. Si cambia la interfaz,
  adjunta una captura y revísalo en celular.

Las reglas completas están en [CONTRIBUTING.md](CONTRIBUTING.md).
