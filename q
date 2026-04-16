[33mbc731b7[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmigrate-to-react19[m[33m, [m[1;31morigin/migrate-to-react19[m[33m, [m[1;31morigin/HEAD[m[33m)[m refactor(admin): rebuild ProjectsReviewPage with evidence/evaluation panels, fix null safety in Settings - Rebuild ProjectsReviewPage to display evidence files, AI evaluations, and Double-Lock pricing inline - Simplify AIEvaluationsPage removing redundant code - Fix optional chaining on exchange rate display in SettingsPage to prevent crash on null
[33m0c28225[m refactor(admin): remove unused BatchUploadPage and AdminDashboardPage, clean nav - Delete BatchUploadPage (replaced by file upload in project flow) - Delete AdminDashboardPage (replaced by workflow-based Inbox) - Remove BatchUploadPage import from App.tsx - Remove Evaluaciones IA standalone nav item from AdminLayout (merged into project review)
[33m3769867[m feat(partner): add monthly restock page, evidence API service, and Phase 2 project form fields - Create evidenceApi.ts with submit, approve, reject monthly evidence calls - Create MonthlyRestockPage for partner monthly evidence submission with file uploads - Add impact_unit_type, impact_unit_spec, monthly_stock fields to ProjectForm - Update ProjectDetail to show Phase 2 stock info and evidence history - Refactor ProjectCertificationPage to use shared components - Add restock route in PartnerRoutes
[33m20d02f1[m feat(shared): add PhotoCarousel, DocumentViewer, FileUploader components and evidence types - Create PhotoCarousel with navigation arrows and fullscreen zoom - Create DocumentViewer for PDF/doc file display with download links - Create FileUploader with drag-and-drop, preview thumbnails, and R2 upload support - Add ProjectEvidence and ProjectEvidenceFile interfaces to evidence.types - Extend EsgProject type with Phase 2 monthly stock and impact unit fields - Extend CreateProjectRequest with impact_unit_type, impact_unit_spec, monthly_stock
[33m94834e6[m fix(admin-ui): resolve type mismatch in MonthlyEvidenceReviewPage - Replace EsgProject state type with ProjectDetailData from adminApi - Rename impact_unit_type to impact_unit matching backend response - Remove unused EsgProject import
[33mc6a7b0c[m feat(admin-ui): add readonly project detail page for ESG inventory - Create AdminProjectDetailPage with header, status badge, AGOTADO indicator - Add 4 stat cards: Price USD/ton, Stock Mensual, Certificados, Revenue - Implement tabbed section: Evidence, Evaluaciones IA, Pricing History, Certificates - Add right panels: Info General, Doble Candado pricing, Stock progress bar, Impact Partner - Add Pause/Reactivate action buttons with status API calls - Full dark mode support with !important Tailwind prefix convention - Add route proyectos/:id in admin routes - Add Eye icon link and clickable project name in ProyectosPage inventory table
[33m546f3a1[m fix(admin-api): update ProjectDetailData interface and fix evidence endpoint - Add typed interfaces: ProjectDetailPricing, ProjectDetailEvaluation, ProjectDetailCertificate, ProjectDetailFile - Update ProjectDetailData with Double-Lock, stock, evidence, and evaluation fields - Fix partner interface to match actual DB schema (remove rut, business_type, add contact_email, website_url) - Rename /evidences to /evidence in API calls - Type getProjectDetail return as ProjectDetailData
[33m1af48c4[m fix(partner): align submit flow with Double-Lock architecture
[33m9eb5fe9[m fix(refresh-token): update to camelCase
[33m1c9b39d[m feat(admin): add Double-Lock pricing modal to project approval
[33m556c6dc[m feat(admin): add Settings page with exchange rate and price calculator
[33mdaba12d[m refactor(admin): restructure navigation to workflow-based Inbox model
[33m0f7cb05[m feat(partner): implement KYB lock for onboarding partners
[33me75d524[m feat(partner): remove financial fields from project form (double-lock)
[33m181f2e3[m refactor(types): sync ProjectType with backend 4 Verticals ESG
[33m51aa00a[m refactor(partner): add dark mode support and migrate gray to slate on Projects list and detail pages
[33md3125e8[m refactor(partner): fix dark mode inheritance and migrate gray to slate on ProjectForm.tsx
[33m3da94a5[m refactor(admin): update AICertDetailPage container for dark mode and replace emojis with Lucide react icons
[33ma0b9b0f[m refactor: replace emojis natively and fix dark mode in ProjectCertificationPage
[33m400c2b6[m refactor: replace emojis natively by matching robust components and icons inside StatusBadges and pages
[33m78c8908[m style: corregir contraste de container AIKybDetailPage y solidez del boton Revisar
[33m9cf0354[m style(partner): fix contrasted title wrapper bug in dark mode out of main grid
[33m7409c13[m fix(partner): add field 'currentBasePriceUsdPerTon'en formulario de proyectos
[33mc5c82da[m feat(admin): implement AI evaluation dashboard and details for KYB/Certifications
[33m4713adc[m chore: add react-markdown for certification report rendering
[33m860da59[m feat: integrate KYB and certification into partner portal navigation
[33m5200546[m feat: add project certification page for ESG project evaluation
[33mbf694a0[m feat: add KYB verification page for partner business validation
[33mcf9ef60[m feat: add usePolling hook for status polling with auto-stop
[33mcba5c7d[m feat: add shared UI components for document upload flows
[33m3bb478b[m feat: add API services for KYB and certification endpoints
[33m1ea0b27[m feat: add TypeScript types for KYB verification and ESG certification
[33m75e612c[m fix: replace React favicon/icons with CompensaTuViaje brand icons
[33me66a014[m fix: white logo on landing navbar + clean logo (no subtitle) on B2C sidebar
[33m2770f7c[m feat: replace all logos with official CompensaTuViaje brand assets
[33me14bc28[m fix: tighten upward dropdown gap - sits closer to button
[33m89cc880[m fix: dropdown closes on scroll + smart flip when near viewport bottom
[33mf82729b[m fix: dropdown menus render outside table for proper z-index stacking
[33maa460ae[m fix: dropdown menus appear next to button using getBoundingClientRect
[33mc5779aa[m fix: menu overlay now positioned as fixed modal - appears centered on screen
[33m85aa929[m fix: menu overlay issues in admin pages - improve z-index and overflow handling
[33m9e58d82[m fix: superadmin dashboard routing - redirect to /admin instead of old mock dashboard
[33m913e232[m fix: production-ready env config - fix all API URLs, add vercel.json SPA routing
[33me0ab0b4[m feat: B2B admin improvements, document management, env vars for production deploy
[33ma9e85bf[m ux: beautiful delete confirmation modal instead of window.confirm
[33mdc7d14b[m feat: retry button with flight data + delete flight button
[33macd651c[m fix: instrucciones sandbox en PaymentResultPage + mejora UX rechazos Webpay
[33m63c78d7[m fix: registrar ruta /b2c/payment-result en App.tsx para Webpay redirect
[33m8188a63[m fix: precarga vuelo en calculadora desde Mis Viajes
[33me00a092[m fix(b2c): precarga datos vuelo pendiente en calculadora
[33m3c0c825[m feat(payments): Webpay integration - payment result page, remove Stripe UI
[33m39f19dc[m feat(app): add NFT routes, certificate search, and update configuration
[33m1b5bb11[m feat(b2c): rewrite B2C pages with real API data and improved UX
[33m69cf9dc[m feat(blockchain): add NFT minting UI and wallet integration for Polygon Mainnet
[33ma7f49dd[m chore(deps): update project dependencies
[33m4aad6cb[m fix(partner): improve project detail page with tabs and data display
[33m719fa2d[m fix(partner): improve partner projects page with status badges and actions
[33mbbcbe6f[m fix(partner): improve partner profile page with correct data display
[33m5ab2be0[m fix(partner): improve partner dashboard with real API data
[33m7a4a781[m fix(partner): improve partner layout with correct navigation and sidebar
[33m77e13ed[m fix(partner): improve partner API service with better error handling
[33m81c0c2b[m fix(b2c): improve projects page with better project cards
[33md86e346[m fix(b2c): improve flights page with better history display
[33mb22f76a[m fix(b2c): improve certificates page with better list display
[33m9ac4ec0[m fix(b2c): improve calculator page integration with calculator component
[33mc05c77e[m fix(b2c): improve B2C dashboard with better stats display
[33m7676cab[m feat(b2c): create certificate generator component
[33m8445ed5[m feat(b2c): create B2C calculator component for emissions calculation
[33m1b33bed[m feat(b2c): create B2C layout component with responsive navigation
[33m3495887[m fix(b2c): improve auth service with better API error handling
[33mb3c013d[m fix(b2c): improve B2C auth context with proper state management
[33m433fab7[m fix(auth): improve auth context with better token handling
[33m9876e1c[m feat(admin): enhance B2C users page with Eye button navigation
[33m39906d3[m feat(admin): add 'Todos' period option and fix chart rendering
[33m30b56e3[m fix(admin): improve proyectos page with correct API data handling
[33ma1da706[m feat(admin): enhance empresas page with Eye button navigation
[33ma438cb2[m fix(admin): improve SuperAdmin dashboard with better stat display
[33mcdffba5[m feat(admin): create B2C user detail page with full profile view
[33m7ceee00[m feat(admin): create empresa detail page with comprehensive company view
[33m6868a86[m feat(admin): update routes with empresa and B2C detail pages
[33m98d7c2f[m feat(admin): rewrite verification panel with real API data
[33m0fe6fa5[m fix(admin): improve partner create modal with better form validation
[33m02d7da8[m fix(admin): remove batch upload from sidebar navigation
[33mb2c1535[m feat(admin): add new API functions for verification, companies, and B2C reports
[33m7b827c2[m refactor(shared): improve helpers utility functions with better type safety
[33m41c5791[m fix(partner): add !important to ProjectForm styles for visibility
[33m3a9dbfd[m feat(blockchain): add NFT certificate integration with Ethereum
[33m8353fa7[m feat(partner): fix Partner module styling with !important CSS and session persistence
[33m01ac35a[m feat(partner): Integración completa del módulo Partner Frontend
[33m6f20092[m fix: update API URLs and improve authentication handling - Change API URLs to use environment variables - Enhance login and logout processes with user type handling - Add loading states for Google sign-in - Refactor public route to support B2B and B2C authentication - Improve error handling and logging in auth services
[33mc47f6fe[m Merge branch 'migrate-to-react19' of github-trabajo:techviiu/Compensatuviaje-Frontend into migrate-to-react19
[33m54ae34f[m fix(auth): fix B2B registration form not showing - Initialize validationErrors as empty object instead of undefined - Remove AnimatePresence wrapper that was blocking rendering - Auto-advance to step 1 when selecting B2B account type
[33m24d7545[m chore: update App.tsx and admin routes configuration - Update route definitions and imports
[33m9fed3b1[m fix(auth): improve Login and Register components - Update authentication flow and styling
[33m4c40b54[m fix(b2b): add dark mode to CarbonCalculator step components - Fix FlightStep: labels, inputs, class cards, dropdowns, map area - Fix ProjectStep: summary cards, project selection cards - Fix PaymentStep: trip summary, certificate, action buttons - Fix ProgressBar: step indicators and progress line
[33m44e6195[m fix(b2b): add dark mode support to CalculatorView and AssistantView - Fix calculator header and info cards - Fix chat container, messages, and input area - Apply dark theme to suggestion chips
[33mca438b8[m fix(b2b): add dark mode support to ImpactStoreView and BadgesView - Fix product cards, prices, and filters in dark mode - Fix badge cards, stat cards, and progress bars - Apply consistent dark theme styling
[33m8980a4e[m fix(b2b): add dark mode support to ProfileView and ProjectsView - Fix white cards and invisible text in dark mode - Add useTheme hook and isDark conditionals - Apply proper background and text colors
[33ma5f0138[m feat(b2c): add AuthCallback page and project assets - Add AuthCallback for OAuth authentication flow - Add scapeland-chileflag image for projects
[33mbe87a86[m feat(shared): add AnimatedBackground component for UI effects
[33m60744ce[m feat(admin): add admin service layer - Add admin services for dashboard management
[33m3e263c2[m feat(b2b): add service layer for B2B dashboard - Add airportService for airport search and autocomplete - Add calculatorService for carbon emission calculations - Add dashboardService for user dashboard data - Add profileService for user profile management - Add projectsService for carbon offset projects
[33m042302e[m feat(admin/empresas): create EmpresasPage with modern UI
[33m5994652[m feat(admin/usuarios-b2c): redesign UsuariosB2CPage with modern UI
[33md75fc58[m feat(admin/dashboard): redesign SuperAdminDashboard with modern UI
[33mb37f079[m feat(admin/reportes): redesign ReportesPage with modern UI
[33m2ee0d2d[m feat(admin/proyectos): redesign ProyectosPage with modern UI
[33m096a11f[m feat(admin): add AdminLayout and refactor base components
[33mec2b58c[m fix(instal npm): update packge-lock
[33m5fd6e73[m chore(build): update build config and dependencies
[33m3d6d6ff[m feat(routing): update routes for B2C features and dual auth
[33m028a6e7[m feat(auth): refactor authentication pages with B2B and B2C separation
[33mbf4a515[m feat(b2c): implement CO2 calculator with chat interface and Stripe
[33m156c9a8[m feat(b2c): create B2C pages with core features
[33m4b31e31[m feat(b2c): add authentication context and services
[33mb340507[m fix: add passengers and roundTrip fields to B2B calculator
[33me4fdd1d[m feat: add B2C and public app components with dark mode
[33m7929a90[m feat: add B2B dashboard views with dark mode support
[33meb1c9f7[m feat: enable dark mode support across application
[33med578e4[m style: implement dark mode in DashboardPanelView
[33m0602b2b[m style: implement dark mode styling in SettingsView
[33m7b8b76d[m feat: add ThemeContext for dark mode support
[33m5630bd0[m refactor(auth): remove old JavaScript authService file - migrated to TypeScript
[33m6817ccb[m refactor(app): clean up main App component and remove outdated docs
[33md864747[m feat(admin): update AdminDashboard component
[33m2d6eb72[m style(auth-components): update auth components with modern design and TypeScript
[33m3d9caa1[m config(typescript): add vite client types to tsconfig
[33m1a2ba33[m config(vite): add Vite environment type definitions
[33m8870f23[m feat(b2c): add B2C dashboard with environmental impact tracking
[33me441ff0[m feat(b2b): add B2B dashboard and route infrastructure
[33m3c54ffe[m feat(auth-pages): update register and dashboard pages with routing logic
[33m1b03260[m feat(auth): add authentication service and context with TypeScript support
[33m9427588[m feat(shared): add API client and validators utilities
[33mcbcdb78[m feat(types): add comprehensive TypeScript types for authentication, companies, documents and dashboard
[33mbf2072b[m no srive
[33m068df2a[m[33m ([m[1;31morigin/wip/frontend-dashboard-fixes-20251215[m[33m)[m fix: JSX structure fixes (duplicate closing tags removed) and layout adjustments
[33m2f9ce2f[m feat: responsive sidebar drawer & mobile hamburger UI (mobile overlay)
[33mdf8f603[m fix(frontend): correct JSX mismatches and responsive sidebar behavior
[33m5dcda3b[m fix(frontend): import FaQuestionCircle to resolve runtime error causing blank screen
[33m189be0c[m feat(frontend): implement Figma-style Dashboard (sidebar, header, summary cards, chart, table, project cards)
[33m442bb03[m[33m ([m[1;31morigin/main[m[33m)[m feat: update from webpack to vite 7 and talwind v4
[33m301e8f4[m[33m ([m[1;31morigin/feature/frontend-modernization-ecologi-style[m[33m)[m feat: refactoring arquitect for more clean
[33m3df12bd[m Initial commit: Frontend completo con diseño moderno Ecologi-style
