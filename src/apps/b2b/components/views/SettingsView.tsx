import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Download,
  Trash2,
  Building,
  FileText,
  Monitor
} from 'lucide-react';
import { useTheme } from '../../../../shared/context/ThemeContext';

// Componente reutilizable para cards con dark mode
const SettingsCard: React.FC<{ children: React.ReactNode; isDark?: boolean }> = ({ children, isDark = false }) => (
  <div className={`!p-6 !rounded-2xl !border !transition-colors ${
    isDark 
      ? '!bg-gray-800/50 !border-gray-700/50 !backdrop-blur-sm' 
      : '!bg-white !border-gray-200 !shadow-sm'
  }`}>
    {children}
  </div>
);

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
}

const SettingsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: 'activity', label: 'Actividad de proyectos', description: 'Actualizaciones sobre tus proyectos y compensaciones', email: true, push: true },
    { id: 'reports', label: 'Informes mensuales', description: 'Resumen de tu impacto ambiental mensual', email: true, push: false },
    { id: 'offers', label: 'Ofertas y promociones', description: 'Descuentos y ofertas especiales', email: false, push: false },
    { id: 'news', label: 'Noticias ambientales', description: 'Artículos y novedades sobre medio ambiente', email: true, push: false },
    { id: 'badges', label: 'Insignias y logros', description: 'Notificaciones cuando desbloquees logros', email: true, push: true },
  ]);

  const sections = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'billing', label: 'Facturación', icon: CreditCard },
    { id: 'company', label: 'Empresa', icon: Building },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'language', label: 'Idioma y región', icon: Globe },
    { id: 'help', label: 'Ayuda', icon: HelpCircle },
  ];

  const toggleNotification = (id: string, type: 'email' | 'push') => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, [type]: !n[type] } : n
    ));
  };

  const renderProfileSection = () => (
    <div className="!space-y-6">
      <div>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Información personal</h3>
        <div className="!space-y-4">
          <div className="!grid sm:!grid-cols-2 !gap-4">
            <div>
              <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Nombre</label>
              <input
                type="text"
                defaultValue="Carlos"
                className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                  isDark 
                    ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                    : '!bg-white !border-gray-200 !text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Apellido</label>
              <input
                type="text"
                defaultValue="González"
                className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                  isDark 
                    ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                    : '!bg-white !border-gray-200 !text-gray-900'
                }`}
              />
            </div>
          </div>
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Email</label>
            <div className="!flex !items-center !gap-2">
              <input
                type="email"
                defaultValue="carlos.gonzalez@empresa.cl"
                className={`!flex-1 !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                  isDark 
                    ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                    : '!bg-white !border-gray-200 !text-gray-900'
                }`}
              />
              <span className={`!px-3 !py-1 !text-xs !font-medium !rounded-full !whitespace-nowrap ${
                isDark ? '!bg-green-900/50 !text-green-300' : '!bg-green-100 !text-green-700'
              }`}>Verificado</span>
            </div>
          </div>
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Teléfono</label>
            <input
              type="tel"
              defaultValue="+56 9 1234 5678"
              className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                isDark 
                  ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                  : '!bg-white !border-gray-200 !text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Cargo</label>
            <input
              type="text"
              defaultValue="Gerente de Sostenibilidad"
              className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                isDark 
                  ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                  : '!bg-white !border-gray-200 !text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>
      <div className={`!pt-4 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
        <button className="!px-6 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium hover:!shadow-lg !transition-all !border-0">
          Guardar cambios
        </button>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="!space-y-6">
      <div>
        <h3 className={`!text-lg !font-semibold !mb-1 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Preferencias de notificación</h3>
        <p className={`!text-sm !mb-4 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Controla cómo y cuándo recibes notificaciones</p>
      </div>
      
      <div className="!space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className={`!flex !items-center !justify-between !p-4 !rounded-xl !border !transition-colors ${
            isDark 
              ? '!bg-gray-800/50 !border-gray-700/50' 
              : '!bg-gray-50 !border-gray-200'
          }`}>
            <div className="!flex-1 !min-w-0">
              <p className={`!font-medium !truncate ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{notif.label}</p>
              <p className={`!text-sm !truncate ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{notif.description}</p>
            </div>
            <div className="!flex !items-center !gap-6 !ml-4 !flex-shrink-0">
              <label className="!flex !items-center !gap-2 !cursor-pointer">
                <div className="!relative">
                  <input
                    type="checkbox"
                    checked={notif.email}
                    onChange={() => toggleNotification(notif.id, 'email')}
                    className="!sr-only"
                  />
                  <div className={`!w-10 !h-6 !rounded-full !transition-colors ${notif.email ? '!bg-green-500' : isDark ? '!bg-gray-600' : '!bg-gray-300'}`}>
                    <div className={`!absolute !top-1 !w-4 !h-4 !bg-white !rounded-full !shadow !transition-transform ${notif.email ? '!translate-x-5' : '!translate-x-1'}`} />
                  </div>
                </div>
                <Mail className={`!w-4 !h-4 ${isDark ? '!text-gray-500' : '!text-gray-400'}`} />
              </label>
              <label className="!flex !items-center !gap-2 !cursor-pointer">
                <div className="!relative">
                  <input
                    type="checkbox"
                    checked={notif.push}
                    onChange={() => toggleNotification(notif.id, 'push')}
                    className="!sr-only"
                  />
                  <div className={`!w-10 !h-6 !rounded-full !transition-colors ${notif.push ? '!bg-green-500' : isDark ? '!bg-gray-600' : '!bg-gray-300'}`}>
                    <div className={`!absolute !top-1 !w-4 !h-4 !bg-white !rounded-full !shadow !transition-transform ${notif.push ? '!translate-x-5' : '!translate-x-1'}`} />
                  </div>
                </div>
                <Smartphone className={`!w-4 !h-4 ${isDark ? '!text-gray-500' : '!text-gray-400'}`} />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="!space-y-6">
      <div>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Cambiar contraseña</h3>
        <div className="!space-y-4">
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Contraseña actual</label>
            <div className="!relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`!w-full !px-4 !py-2.5 !pr-12 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                  isDark 
                    ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                    : '!bg-white !border-gray-200 !text-gray-900'
                }`}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={`!absolute !right-3 !top-1/2 !-translate-y-1/2 !border-0 !bg-transparent ${isDark ? '!text-gray-500 hover:!text-gray-400' : '!text-gray-400 hover:!text-gray-600'}`}
              >
                {showPassword ? <EyeOff className="!w-5 !h-5" /> : <Eye className="!w-5 !h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Nueva contraseña</label>
            <input
              type="password"
              className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                isDark 
                  ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                  : '!bg-white !border-gray-200 !text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Confirmar contraseña</label>
            <input
              type="password"
              className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                isDark 
                  ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                  : '!bg-white !border-gray-200 !text-gray-900'
              }`}
            />
          </div>
        </div>
        <button className="!mt-4 !px-6 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium hover:!shadow-lg !transition-all !border-0">
          Actualizar contraseña
        </button>
      </div>

      <div className={`!pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Autenticación de dos factores</h3>
        <div className={`!flex !items-center !justify-between !p-4 !rounded-xl !border ${
          isDark 
            ? '!bg-yellow-900/20 !border-yellow-800/30' 
            : '!bg-yellow-50 !border-yellow-200'
        }`}>
          <div className="!flex !items-center !gap-3">
            <div className={`!w-10 !h-10 !rounded-xl !flex !items-center !justify-center ${
              isDark ? '!bg-yellow-900/30' : '!bg-yellow-100'
            }`}>
              <Shield className={`!w-5 !h-5 ${isDark ? '!text-yellow-400' : '!text-yellow-600'}`} />
            </div>
            <div>
              <p className={`!font-medium ${isDark ? '!text-yellow-300' : '!text-gray-900'}`}>2FA no habilitado</p>
              <p className={`!text-sm ${isDark ? '!text-yellow-200/60' : '!text-gray-500'}`}>Añade una capa extra de seguridad</p>
            </div>
          </div>
          <button className="!px-4 !py-2 !bg-yellow-500 hover:!bg-yellow-600 !text-white !rounded-xl !font-medium !transition-colors !border-0">
            Habilitar
          </button>
        </div>
      </div>

      <div className={`!pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Sesiones activas</h3>
        <div className="!space-y-3">
          <div className={`!flex !items-center !justify-between !p-4 !rounded-xl !border !transition-colors ${
            isDark 
              ? '!bg-gray-800/50 !border-gray-700/50' 
              : '!bg-gray-50 !border-gray-200'
          }`}>
            <div className="!flex !items-center !gap-3 !min-w-0">
              <div className={`!w-10 !h-10 !rounded-xl !flex !items-center !justify-center !flex-shrink-0 ${
                isDark ? '!bg-green-900/30' : '!bg-green-100'
              }`}>
                <Smartphone className={`!w-5 !h-5 ${isDark ? '!text-green-400' : '!text-green-600'}`} />
              </div>
              <div className="!min-w-0">
                <p className={`!font-medium !truncate ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Este dispositivo</p>
                <p className={`!text-sm !truncate ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Chrome · Windows · Santiago, Chile</p>
              </div>
            </div>
            <span className={`!px-3 !py-1 !text-xs !font-medium !rounded-full !whitespace-nowrap !ml-2 ${
              isDark ? '!bg-green-900/50 !text-green-300' : '!bg-green-100 !text-green-700'
            }`}>Activa</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingSection = () => (
    <div className="!space-y-6">
      <div>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Plan actual</h3>
        <div className={`!rounded-2xl !p-6 !border !transition-colors ${
          isDark 
            ? '!bg-gradient-to-br !from-green-900/30 !to-emerald-900/20 !border-green-800/30' 
            : '!bg-gradient-to-br !from-green-50 !to-emerald-50 !border-green-200'
        }`}>
          <div className="!flex !items-center !justify-between !mb-4 !flex-wrap !gap-4">
            <div>
              <span className={`!px-3 !py-1 !bg-green-500 !text-white !text-xs !font-semibold !rounded-full !block !w-fit`}>PRO EMPRESAS</span>
              <p className={`!text-2xl !font-bold !mt-2 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>$150.000 <span className={`!text-sm !font-normal ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>/mes</span></p>
            </div>
            <button className={`!px-4 !py-2 !rounded-xl !font-medium !border !transition-colors ${
              isDark 
                ? '!bg-gray-700/50 !text-green-300 !border-green-800/30 hover:!bg-gray-700' 
                : '!bg-white !text-green-600 !border-green-200 hover:!bg-green-50'
            }`}>
              Cambiar plan
            </button>
          </div>
          <div className="!grid sm:!grid-cols-3 !gap-4 !text-sm">
            <div className="!flex !items-center !gap-2">
              <Check className="!w-4 !h-4 !text-green-500 !flex-shrink-0" />
              <span className={isDark ? '!text-gray-300' : '!text-gray-600'}>Usuarios ilimitados</span>
            </div>
            <div className="!flex !items-center !gap-2">
              <Check className="!w-4 !h-4 !text-green-500 !flex-shrink-0" />
              <span className={isDark ? '!text-gray-300' : '!text-gray-600'}>Reportes avanzados</span>
            </div>
            <div className="!flex !items-center !gap-2">
              <Check className="!w-4 !h-4 !text-green-500 !flex-shrink-0" />
              <span className={isDark ? '!text-gray-300' : '!text-gray-600'}>Soporte prioritario</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`!pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Método de pago</h3>
        <div className={`!flex !items-center !justify-between !p-4 !rounded-xl !border !transition-colors ${
          isDark 
            ? '!bg-gray-800/50 !border-gray-700/50' 
            : '!bg-gray-50 !border-gray-200'
        }`}>
          <div className="!flex !items-center !gap-3 !min-w-0">
            <div className="!w-12 !h-8 !bg-blue-600 !rounded-md !flex !items-center !justify-center !text-white !text-xs !font-bold !flex-shrink-0">
              VISA
            </div>
            <div className="!min-w-0">
              <p className={`!font-medium !truncate ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>•••• •••• •••• 4242</p>
              <p className={`!text-sm !truncate ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Vence 12/26</p>
            </div>
          </div>
          <button className={`!font-medium !text-sm !border-0 !bg-transparent !whitespace-nowrap !ml-2 ${
            isDark ? '!text-green-400 hover:!text-green-300' : '!text-green-600 hover:!text-green-700'
          }`}>
            Editar
          </button>
        </div>
      </div>

      <div className={`!pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
        <div className="!flex !items-center !justify-between !mb-4">
          <h3 className={`!text-lg !font-semibold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Historial de facturación</h3>
          <button className={`!flex !items-center !gap-2 !font-medium !text-sm !border-0 !bg-transparent ${
            isDark ? '!text-green-400 hover:!text-green-300' : '!text-green-600 hover:!text-green-700'
          }`}>
            <Download className="!w-4 !h-4" />
            Descargar todo
          </button>
        </div>
        <div className="!space-y-3">
          {[
            { date: '1 Dic 2024', amount: '$150.000', status: 'Pagado' },
            { date: '1 Nov 2024', amount: '$150.000', status: 'Pagado' },
            { date: '1 Oct 2024', amount: '$150.000', status: 'Pagado' },
          ].map((invoice, index) => (
            <div key={index} className={`!flex !items-center !justify-between !p-4 !rounded-xl !border !transition-colors ${
              isDark 
                ? '!bg-gray-800/50 !border-gray-700/50' 
                : '!bg-gray-50 !border-gray-200'
            }`}>
              <div className="!flex !items-center !gap-3 !min-w-0">
                <FileText className={`!w-5 !h-5 !flex-shrink-0 ${isDark ? '!text-gray-500' : '!text-gray-400'}`} />
                <div className="!min-w-0">
                  <p className={`!font-medium !truncate ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{invoice.date}</p>
                  <p className={`!text-sm !truncate ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{invoice.amount}</p>
                </div>
              </div>
              <div className="!flex !items-center !gap-3 !ml-2">
                <span className={`!px-3 !py-1 !text-xs !font-medium !rounded-full !whitespace-nowrap ${
                  isDark ? '!bg-green-900/50 !text-green-300' : '!bg-green-100 !text-green-700'
                }`}>{invoice.status}</span>
                <button className={`border-0 !bg-transparent ${isDark ? '!text-gray-500 hover:!text-gray-400' : '!text-gray-400 hover:!text-gray-600'}`}>
                  <Download className="!w-4 !h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompanySection = () => (
    <div className="!space-y-6">
      <div>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Información de la empresa</h3>
        <div className="!space-y-4">
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Nombre de la empresa</label>
            <input
              type="text"
              defaultValue="TechCorp S.A."
              className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                isDark 
                  ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                  : '!bg-white !border-gray-200 !text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>RUT</label>
            <input
              type="text"
              defaultValue="76.123.456-7"
              className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                isDark 
                  ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                  : '!bg-white !border-gray-200 !text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Dirección</label>
            <input
              type="text"
              defaultValue="Av. Providencia 1234, Santiago"
              className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
                isDark 
                  ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                  : '!bg-white !border-gray-200 !text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`!block !text-sm !font-medium !mb-1.5 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>Industria</label>
            <select className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
              isDark 
                ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
                : '!bg-white !border-gray-200 !text-gray-900'
            }`}>
              <option>Tecnología</option>
              <option>Retail</option>
              <option>Manufactura</option>
              <option>Servicios</option>
              <option>Otro</option>
            </select>
          </div>
        </div>
        <button className="!mt-4 !px-6 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium hover:!shadow-lg !transition-all !border-0">
          Guardar cambios
        </button>
      </div>
    </div>
  );

  const renderAppearanceSection = () => (
    <div className="!space-y-6">
      <div>
        <h3 className="!text-lg !font-semibold !text-gray-900 dark:!text-white !mb-4">Tema</h3>
        <div className="!grid !grid-cols-3 !gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`!p-4 !rounded-xl !border-2 !transition-all ${
              theme === 'light' 
                ? '!border-green-500 !bg-green-50 dark:!bg-green-900/30' 
                : '!border-gray-200 dark:!border-gray-700 hover:!border-gray-300 dark:hover:!border-gray-600'
            }`}
          >
            <Sun className="!w-8 !h-8 !mx-auto !mb-2 !text-yellow-500" />
            <p className="!text-sm !font-medium !text-center !text-gray-700 dark:!text-gray-300">Claro</p>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`!p-4 !rounded-xl !border-2 !transition-all ${
              theme === 'dark' 
                ? '!border-green-500 !bg-green-50 dark:!bg-green-900/30' 
                : '!border-gray-200 dark:!border-gray-700 hover:!border-gray-300 dark:hover:!border-gray-600'
            }`}
          >
            <Moon className="!w-8 !h-8 !mx-auto !mb-2 !text-indigo-500" />
            <p className="!text-sm !font-medium !text-center !text-gray-700 dark:!text-gray-300">Oscuro</p>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`!p-4 !rounded-xl !border-2 !transition-all ${
              theme === 'system' 
                ? '!border-green-500 !bg-green-50 dark:!bg-green-900/30' 
                : '!border-gray-200 dark:!border-gray-700 hover:!border-gray-300 dark:hover:!border-gray-600'
            }`}
          >
            <Monitor className="!w-8 !h-8 !mx-auto !mb-2 !text-gray-500" />
            <p className="!text-sm !font-medium !text-center !text-gray-700 dark:!text-gray-300">Sistema</p>
          </button>
        </div>
        <p className="!text-sm !text-gray-500 dark:!text-gray-400 !mt-3">
          {theme === 'system' 
            ? `Tema actual: ${resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'} (basado en tu sistema)`
            : `Tema seleccionado: ${theme === 'dark' ? 'Oscuro' : 'Claro'}`
          }
        </p>
      </div>

      <div className="!pt-6 !border-t !border-gray-100 dark:!border-gray-700">
        <h3 className="!text-lg !font-semibold !text-gray-900 dark:!text-white !mb-4">Vista previa</h3>
        <div className={`!p-6 !rounded-xl !border ${
          resolvedTheme === 'dark' 
            ? '!bg-gray-800 !border-gray-700' 
            : '!bg-white !border-gray-200'
        }`}>
          <div className="!flex !items-center !gap-4 !mb-4">
            <div className={`!w-12 !h-12 !rounded-full ${
              resolvedTheme === 'dark' ? '!bg-gray-700' : '!bg-gray-200'
            }`}></div>
            <div>
              <div className={`!h-4 !w-32 !rounded ${
                resolvedTheme === 'dark' ? '!bg-gray-700' : '!bg-gray-200'
              }`}></div>
              <div className={`!h-3 !w-24 !rounded !mt-2 ${
                resolvedTheme === 'dark' ? '!bg-gray-600' : '!bg-gray-100'
              }`}></div>
            </div>
          </div>
          <div className={`!h-3 !w-full !rounded !mb-2 ${
            resolvedTheme === 'dark' ? '!bg-gray-700' : '!bg-gray-200'
          }`}></div>
          <div className={`!h-3 !w-3/4 !rounded ${
            resolvedTheme === 'dark' ? '!bg-gray-700' : '!bg-gray-200'
          }`}></div>
        </div>
      </div>
    </div>
  );

  const renderLanguageSection = () => (
    <div className="!space-y-6">
      <div>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Idioma</h3>
        <select className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
          isDark 
            ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
            : '!bg-white !border-gray-200 !text-gray-900'
        }`}>
          <option>Español (Chile)</option>
          <option>Español (México)</option>
          <option>English (US)</option>
          <option>Português (Brasil)</option>
        </select>
      </div>
      <div>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Zona horaria</h3>
        <select className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
          isDark 
            ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
            : '!bg-white !border-gray-200 !text-gray-900'
        }`}>
          <option>América/Santiago (GMT-3)</option>
          <option>América/Buenos_Aires (GMT-3)</option>
          <option>América/Lima (GMT-5)</option>
          <option>América/Mexico_City (GMT-6)</option>
        </select>
      </div>
      <div>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Formato de fecha</h3>
        <select className={`!w-full !px-4 !py-2.5 !border !rounded-xl focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none !transition-colors ${
          isDark 
            ? '!bg-gray-700/50 !border-gray-600 !text-gray-100' 
            : '!bg-white !border-gray-200 !text-gray-900'
        }`}>
          <option>DD/MM/YYYY</option>
          <option>MM/DD/YYYY</option>
          <option>YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  );

  const renderHelpSection = () => (
    <div className="!space-y-6">
      <div className="!grid sm:!grid-cols-2 !gap-4">
        <div className={`!p-6 !rounded-2xl !border !transition-colors !cursor-pointer hover:!shadow-md ${
          isDark 
            ? '!bg-blue-900/20 !border-blue-800/30 hover:!bg-blue-900/30' 
            : '!bg-blue-50 !border-blue-200 hover:!shadow-md'
        }`}>
          <HelpCircle className={`!w-8 !h-8 !mb-3 ${isDark ? '!text-blue-400' : '!text-blue-500'}`} />
          <h4 className={`!font-semibold !mb-1 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Centro de ayuda</h4>
          <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>Guías, tutoriales y preguntas frecuentes</p>
        </div>
        <div className={`!p-6 !rounded-2xl !border !transition-colors !cursor-pointer hover:!shadow-md ${
          isDark 
            ? '!bg-green-900/20 !border-green-800/30 hover:!bg-green-900/30' 
            : '!bg-green-50 !border-green-200 hover:!shadow-md'
        }`}>
          <Mail className={`!w-8 !h-8 !mb-3 ${isDark ? '!text-green-400' : '!text-green-500'}`} />
          <h4 className={`!font-semibold !mb-1 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Contactar soporte</h4>
          <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>Escríbenos y te responderemos pronto</p>
        </div>
      </div>

      <div className={`!pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
        <h3 className={`!text-lg !font-semibold !mb-4 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Zona de peligro</h3>
        <div className={`!p-4 !rounded-xl !border !transition-colors ${
          isDark 
            ? '!bg-red-900/20 !border-red-800/30' 
            : '!bg-red-50 !border-red-200'
        }`}>
          <div className="!flex !items-start !gap-3">
            <AlertTriangle className={`!w-5 !h-5 !mt-0.5 !flex-shrink-0 ${isDark ? '!text-red-400' : '!text-red-500'}`} />
            <div className="!flex-1">
              <p className={`!font-medium ${isDark ? '!text-red-300' : '!text-red-800'}`}>Eliminar cuenta</p>
              <p className={`!text-sm !mb-3 ${isDark ? '!text-red-200/70' : '!text-red-600'}`}>Esta acción es irreversible y eliminará todos tus datos.</p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="!px-4 !py-2 !bg-red-500 hover:!bg-red-600 !text-white !rounded-xl !font-medium !text-sm !transition-colors !border-0"
              >
                Eliminar mi cuenta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSection();
      case 'notifications': return renderNotificationsSection();
      case 'security': return renderSecuritySection();
      case 'billing': return renderBillingSection();
      case 'company': return renderCompanySection();
      case 'appearance': return renderAppearanceSection();
      case 'language': return renderLanguageSection();
      case 'help': return renderHelpSection();
      default: return renderProfileSection();
    }
  };

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div>
        <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Configuración de cuenta</h1>
        <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Administra tu cuenta y preferencias</p>
      </div>

      <div className="!grid lg:!grid-cols-4 !gap-6">
        {/* Sidebar */}
        <div className="lg:!col-span-1">
          <nav className={`!rounded-2xl !p-2 !border !transition-colors ${
            isDark 
              ? '!bg-gray-800/50 !border-gray-700/50' 
              : '!bg-white !border-gray-200 !shadow-sm'
          }`}>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-left !transition-all !border-0 ${
                  activeSection === section.id
                    ? '!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white'
                    : isDark
                    ? '!text-gray-400 hover:!bg-gray-700/50 hover:!text-gray-200'
                    : '!text-gray-600 hover:!bg-gray-100'
                }`}
              >
                <section.icon className="!w-5 !h-5" />
                <span className="!font-medium">{section.label}</span>
                {activeSection === section.id && (
                  <ChevronRight className="!w-4 !h-4 !ml-auto" />
                )}
              </button>
            ))}
            
            <div className={`!border-t !mt-2 !pt-2 ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
              <button className={`!w-full !flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-left !transition-all !border-0 ${
                isDark 
                  ? '!text-red-400 hover:!bg-red-900/20' 
                  : '!text-red-600 hover:!bg-red-50'
              }`}>
                <LogOut className="!w-5 !h-5" />
                <span className="!font-medium">Cerrar sesión</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:!col-span-3">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={`!rounded-2xl !p-6 !border !transition-colors ${
              isDark 
                ? '!bg-gray-800/50 !border-gray-700/50' 
                : '!bg-white !border-gray-200 !shadow-sm'
            }`}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !z-50 !flex !items-center !justify-center !p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`!rounded-2xl !p-6 !max-w-md !w-full !shadow-2xl !transition-colors ${
              isDark 
                ? '!bg-gray-800 !border !border-gray-700' 
                : '!bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`!w-16 !h-16 !rounded-full !mx-auto !mb-4 !flex !items-center !justify-center ${
              isDark ? '!bg-red-900/30' : '!bg-red-100'
            }`}>
              <Trash2 className={`!w-8 !h-8 ${isDark ? '!text-red-400' : '!text-red-500'}`} />
            </div>
            <h3 className={`!text-xl !font-bold !text-center !mb-2 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>¿Eliminar cuenta?</h3>
            <p className={`!text-center !mb-6 ${isDark ? '!text-gray-400' : '!text-gray-600'}`}>
              Esta acción eliminará permanentemente todos tus datos, proyectos e historial de compensaciones.
            </p>
            <div className="!flex !gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`!flex-1 !py-3 !rounded-xl !font-medium !transition-colors !border-0 ${
                  isDark 
                    ? '!bg-gray-700 hover:!bg-gray-600 !text-gray-200' 
                    : '!bg-gray-100 hover:!bg-gray-200 !text-gray-700'
                }`}
              >
                Cancelar
              </button>
              <button className="!flex-1 !py-3 !bg-red-500 hover:!bg-red-600 !text-white !rounded-xl !font-medium !transition-colors !border-0">
                Eliminar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SettingsView;
