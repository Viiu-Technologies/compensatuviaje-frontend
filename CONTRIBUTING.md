# Cómo trabajar en el frontend

Guía para levantar el proyecto y para contribuir sin pisarnos. Si algo de aquí
no funciona, corrígelo en un PR: esta guía es de todos.

## Levantar el proyecto en local

### Requisitos

- **Node 22**
- **pnpm 11.** El proyecto fija la versión en `package.json`; con
  `corepack enable` se usa la correcta sola. No uses `npm install`: el lockfile
  del proyecto es `pnpm-lock.yaml`.
- **El backend corriendo** en `http://localhost:3002` (ver el `CONTRIBUTING.md`
  del repo del backend).

### Pasos

```bash
corepack enable
pnpm install

cp .env.example .env     # ya apunta al backend local

pnpm dev                 # http://localhost:3000
```

Entra al panel con el superadmin que crea el seed del backend:
`superadmin@compensatuviaje.com` / `ChangeMeInProduction!`.

El login de personas (B2C) necesita las claves de Supabase en el `.env`. Sin
ellas funcionan la landing, la calculadora y los paneles de empresa, partner y
admin.

### Comandos útiles

| Comando | Para qué |
|---|---|
| `pnpm dev` | Servidor de desarrollo en el puerto 3000 |
| `pnpm build` | Compilar como en producción (lo mismo que corre el CI) |
| `pnpm typecheck` | Revisar tipos de TypeScript |
| `pnpm preview` | Ver el build de producción en local |

## Cómo contribuir

### Ramas

- **`main` es la fuente de verdad.** No se hace push directo: todo entra por
  Pull Request.
- **Producción** solo se actualiza desde `main`, y solo lo hacen los líderes.
- **Una rama por tarea del backlog**, con su ID de Notion:
  `feat/CTV-23-ingresos-separados`, `fix/CTV-41-refresh-token`.
- **Las ramas viven máximo 2 días.** Si la tarea es más grande, divídela en
  varios PRs.
- **Actualiza tu rama con `main` todos los días:**

  ```bash
  git fetch origin
  git rebase origin/main
  ```

### Pull Requests

- **Chicos: menos de ~400 líneas.** Un PR enorme generado con IA parece
  correcto y nadie lo revisa de verdad.
- **El CI tiene que estar en verde.** Compila en cada PR. Por ahora no bloquea
  el merge automáticamente: el acuerdo es no hacer merge en rojo.
- **Nadie aprueba su propio PR.** Revisa el líder del área (ver
  `.github/CODEOWNERS`). Si el PR toca dos áreas, revisan los dos.
- Si cambia la interfaz, adjunta una captura y revísalo también en celular.
- **Nunca muestres datos inventados como si fueran reales.** Si el backend no
  devuelve datos o falla, se muestra un estado vacío o un error con
  "Reintentar", no cifras de ejemplo.

### Archivos calientes

Los toca todo el mundo y ahí nacen casi todos los conflictos:

- `src/App.tsx` (rutas)
- `src/shared/services/` (clientes de la API)
- `package.json` y `pnpm-lock.yaml`

Reglas:

- Avisa en el chat antes de tocarlos.
- Van en un **PR propio y chico**, separado de la funcionalidad.
- En un conflicto de `pnpm-lock.yaml`, no lo edites a mano: acepta la versión de
  `main` y corre `pnpm install`.

### Variables de entorno

Si agregas una variable `VITE_`, documéntala en `.env.example` en el mismo PR.
Recuerda que todas son públicas: lo secreto va en el backend.
