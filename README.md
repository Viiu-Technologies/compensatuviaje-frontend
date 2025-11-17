# Compensa tu Viaje - Frontend# Getting Started with Create React App



Frontend de la aplicación Compensa tu Viaje desarrollado en React.This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



## 🚀 Tecnologías## Available Scripts



- **React 18.3.1**: Librería principalIn the project directory, you can run:

- **React Router DOM 6**: Navegación y rutas

- **Axios**: Cliente HTTP para API calls### `npm start`

- **CSS3**: Estilos personalizados

Runs the app in the development mode.\

## 📁 Estructura del ProyectoOpen [http://localhost:3000](http://localhost:3000) to view it in your browser.



```The page will reload when you make changes.\

compensatuviajefront/You may also see any lint errors in the console.

├── public/                      # Archivos públicos estáticos

│   ├── images/                  # Imágenes del sitio### `npm test`

│   │   ├── brand/              # Logos y branding

│   │   └── payment-logos/      # Logos de métodos de pagoLaunches the test runner in the interactive watch mode.\

│   ├── index.htmlSee the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

│   └── manifest.json

├── src/### `npm run build`

│   ├── components/             # Componentes React

│   │   ├── admin/             # Módulos de administraciónBuilds the app for production to the `build` folder.\

│   │   │   ├── AdminDashboard.jsIt correctly bundles React in production mode and optimizes the build for the best performance.

│   │   │   ├── VerificationPanel.js

│   │   │   └── BatchUpload.jsThe build is minified and the filenames include the hashes.\

│   │   ├── auth/              # Autenticación y dashboardYour app is ready to be deployed!

│   │   │   ├── Login.js

│   │   │   ├── Register.jsSee the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

│   │   │   ├── RegisterWizard.js

│   │   │   ├── Dashboard.js### `npm run eject`

│   │   │   ├── ForgotPassword.js

│   │   │   ├── PrivateRoute.js**Note: this is a one-way operation. Once you `eject`, you can't go back!**

│   │   │   └── PublicRoute.js

│   │   ├── onboarding/        # Módulo de onboardingIf you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

│   │   │   ├── CompanyOnboardingWizard.js

│   │   │   ├── OnboardingEdit.jsInstead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

│   │   │   └── OnboardingStatus.js

│   │   └── ...                # Componentes públicos (Hero, Features, etc.)You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

│   ├── context/               # React Context

│   │   └── AuthContext.js     # Contexto de autenticación## Learn More

│   ├── services/              # Servicios y API calls

│   │   ├── api.js            # Configuración AxiosYou can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

│   │   ├── authService.js    # Servicios de autenticación

│   │   └── onboardingService.jsTo learn React, check out the [React documentation](https://reactjs.org/).

│   ├── utils/                 # Utilidades

│   │   ├── errorHandler.js   # Manejo de errores### Code Splitting

│   │   └── helpers.js

│   ├── App.js                # Componente principalThis section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

│   ├── App.css

│   └── index.js              # Entry point### Analyzing the Bundle Size

├── .env                       # Variables de entorno (no subir a git)

├── .env.example              # Ejemplo de variables de entornoThis section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

├── .gitignore

├── package.json### Making a Progressive Web App

└── README.md

```This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)



## 🔧 Instalación### Advanced Configuration



```bashThis section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

# Instalar dependencias

npm install### Deployment



# Copiar variables de entornoThis section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

cp .env.example .env

### `npm run build` fails to minify

# Editar .env y configurar la URL del backend

# REACT_APP_API_URL=http://localhost:3001/apiThis section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

```

## 🏃 Ejecución

```bash
# Modo desarrollo (puerto 3000)
npm start

# Build para producción
npm run build

# Ejecutar tests
npm test
```

## 🌐 Variables de Entorno

```env
REACT_APP_API_URL=http://localhost:3001/api
NODE_ENV=development
```

## 📋 Módulos Principales

### 1. **Módulo de Autenticación** (`/auth`)
- Login de usuarios
- Registro de empresas (wizard de 4 pasos)
- Recuperación de contraseña
- Dashboard de usuario
- Rutas protegidas

### 2. **Módulo de Onboarding** (`/onboarding`)
- Wizard de registro de empresa
- Edición de información de empresa
- Estado del proceso de onboarding
- Carga de documentos

### 3. **Módulo de Administración** (`/admin`)
- Dashboard administrativo
- Panel de verificación de empresas
- Carga masiva de viajes (batch upload)

### 4. **Landing Page**
- Hero section con calculadora de carbono
- Features y beneficios
- Testimonios
- FAQ
- Footer con información de contacto

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) con:
- **Access Token**: Expira en 15 minutos
- **Refresh Token**: Se usa para renovar el access token

Los tokens se guardan en `localStorage` y se envían automáticamente en cada request mediante interceptores de Axios.

## 📱 Rutas de la Aplicación

### Rutas Públicas
- `/` - Landing page
- `/login` - Inicio de sesión
- `/register` - Registro (wizard)
- `/forgot-password` - Recuperar contraseña

### Rutas Privadas (requieren autenticación)
- `/dashboard` - Dashboard del usuario
- `/onboarding/wizard` - Wizard de onboarding
- `/onboarding/edit` - Editar información de empresa
- `/onboarding/status` - Estado del onboarding
- `/admin` - Dashboard administrativo
- `/admin/verification` - Panel de verificación
- `/admin/batch-upload` - Carga masiva

## 🔌 Integración con Backend

El frontend se comunica con el backend mediante:

1. **authService**: Autenticación (login, register, logout)
2. **onboardingService**: Gestión de empresas y documentos
3. **api**: Cliente Axios configurado con interceptores

### Ejemplo de uso:

```javascript
import authService from './services/authService';

// Login
const response = await authService.login(email, password);

// El response incluye:
// - access_token
// - refresh_token
// - user_info (id, email, name, company_id, role, etc.)
```

## 📦 Build y Deploy

```bash
# Crear build de producción
npm run build

# El build se genera en /build
# Puede ser servido por cualquier servidor estático (Nginx, Apache, etc.)
```

## 📞 Soporte

Para dudas o problemas:
1. Revisar la consola del navegador (F12)
2. Verificar que el backend esté corriendo
3. Revisar la documentación del backend en `../compensatuviajeback`
