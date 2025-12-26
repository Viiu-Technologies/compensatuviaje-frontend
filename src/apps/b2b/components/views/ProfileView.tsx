import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  Award,
  Leaf,
  Camera,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../auth/context/AuthContext';
import { useTheme } from '../../../../shared/context/ThemeContext';
import { getUserProfile, updateUserProfile, getMockUserProfile, type UserProfile as ApiUserProfile } from '../../services/profileService';

interface LocalUserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  location: string;
  joinDate: string;
  avatar?: string;
}

interface ProfileViewProps {
  user?: {
    name?: string;
    email?: string;
  };
}

const ProfileView: React.FC<ProfileViewProps> = () => {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [profile, setProfile] = useState<LocalUserProfile>({
    name: user?.name || 'Usuario Empresarial',
    email: user?.email || 'admin@empresa.com',
    phone: '+56 9 1234 5678',
    company: 'Empresa Demo S.A.',
    position: 'Gerente de Sostenibilidad',
    location: 'Santiago, Chile',
    joinDate: 'Diciembre 2024'
  });

  const [editedProfile, setEditedProfile] = useState<LocalUserProfile>(profile);

  // Cargar perfil desde API al montar
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const apiProfile = await getUserProfile();
        if (apiProfile) {
          const mappedProfile: LocalUserProfile = {
            name: apiProfile.name || user?.name || 'Usuario',
            email: apiProfile.email || user?.email || '',
            phone: apiProfile.phone || '+56 9 0000 0000',
            company: apiProfile.company?.razonSocial || 'Sin empresa',
            position: 'Gerente de Sostenibilidad', // No está en API, demo
            location: 'Santiago, Chile', // No está en API, demo
            joinDate: new Date(apiProfile.createdAt).toLocaleDateString('es-CL', { 
              month: 'long', 
              year: 'numeric' 
            })
          };
          setProfile(mappedProfile);
          setEditedProfile(mappedProfile);
        } else {
          // Usar datos mock si no hay API
          const mockProfile = getMockUserProfile(user?.email);
          const mappedProfile: LocalUserProfile = {
            name: mockProfile.name,
            email: mockProfile.email,
            phone: mockProfile.phone || '+56 9 0000 0000',
            company: mockProfile.company?.razonSocial || 'Sin empresa',
            position: 'Gerente de Sostenibilidad',
            location: 'Santiago, Chile',
            joinDate: 'Diciembre 2024'
          };
          setProfile(mappedProfile);
          setEditedProfile(mappedProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const response = await updateUserProfile({
        name: editedProfile.name,
        phone: editedProfile.phone
      });
      
      if (response.success) {
        setProfile(editedProfile);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(response.message || 'Error guardando cambios');
      }
    } catch (error) {
      // Si falla la API, guardar localmente (demo)
      setProfile(editedProfile);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const stats = [
    { label: 'Proyectos Activos', value: '3', icon: Leaf, color: 'green' },
    { label: 'Compensaciones', value: '12', icon: Award, color: 'yellow' },
    { label: 'Nivel de Impacto', value: 'Oro', icon: Shield, color: 'amber' }
  ];

  return (
    <div className="!space-y-6">
      {/* Header */}
      <div className="!flex !items-center !justify-between">
        <div>
          <h1 className={`!text-2xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Tu Perfil</h1>
          <p className={`!text-sm !mt-1 ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>Gestiona tu información personal y de empresa</p>
        </div>
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)}
            className="!flex !items-center !gap-2 !px-4 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium !text-sm !border-0 !shadow-lg !shadow-green-500/30 hover:!shadow-green-500/50 !transition-all"
          >
            <Edit3 className="!w-4 !h-4" />
            Editar Perfil
          </motion.button>
        ) : (
          <div className="!flex !gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              className={`!flex !items-center !gap-2 !px-4 !py-2.5 !rounded-xl !font-medium !text-sm !border-0 hover:!opacity-80 !transition-all ${
                isDark ? '!bg-gray-700 !text-gray-300' : '!bg-gray-100 !text-gray-700 hover:!bg-gray-200'
              }`}
            >
              <X className="!w-4 !h-4" />
              Cancelar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="!flex !items-center !gap-2 !px-4 !py-2.5 !bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white !rounded-xl !font-medium !text-sm !border-0 !shadow-lg !shadow-green-500/30 hover:!shadow-green-500/50 !transition-all disabled:!opacity-60"
            >
              {isSaving ? (
                <Loader2 className="!w-4 !h-4 !animate-spin" />
              ) : (
                <Save className="!w-4 !h-4" />
              )}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </motion.button>
          </div>
        )}
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="!bg-green-50 !border !border-green-200 !text-green-700 !px-4 !py-3 !rounded-xl !text-sm !flex !items-center !gap-2"
        >
          <Leaf className="!w-4 !h-4" />
          Perfil actualizado exitosamente
        </motion.div>
      )}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="!bg-red-50 !border !border-red-200 !text-red-700 !px-4 !py-3 !rounded-xl !text-sm"
        >
          {saveError}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="!flex !items-center !justify-center !py-20">
          <div className="!text-center">
            <Loader2 className="!w-12 !h-12 !text-green-500 !animate-spin !mx-auto !mb-4" />
            <p className="!text-gray-500">Cargando perfil...</p>
          </div>
        </div>
      ) : (
      <div className="!grid lg:!grid-cols-3 !gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:!col-span-1"
        >
          <div className={`!rounded-2xl !p-6 !border !shadow-lg ${
            isDark ? '!bg-gray-800/50 !border-gray-700' : '!bg-white !border-gray-200'
          }`}>
            <div className="!text-center">
              {/* Avatar */}
              <div className="!relative !inline-block !mb-4">
                <div className="!w-28 !h-28 !rounded-full !bg-gradient-to-br !from-green-400 !to-emerald-600 !flex !items-center !justify-center !text-white !text-4xl !font-bold !shadow-lg !shadow-green-500/30 !mx-auto">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                {isEditing && (
                  <button className={`!absolute !bottom-0 !right-0 !w-10 !h-10 !rounded-full !shadow-lg !flex !items-center !justify-center !border hover:!opacity-80 !transition-colors ${
                    isDark ? '!bg-gray-700 !border-gray-600' : '!bg-white !border-gray-200 hover:!bg-gray-50'
                  }`}>
                    <Camera className={`!w-5 !h-5 ${isDark ? '!text-gray-300' : '!text-gray-600'}`} />
                  </button>
                )}
              </div>

              <h2 className={`!text-xl !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{profile.name}</h2>
              <p className={`!text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{profile.position}</p>
              <p className="!text-green-600 !text-sm !font-medium !mt-1">{profile.company}</p>

              {/* Quick Stats */}
              <div className={`!grid !grid-cols-3 !gap-3 !mt-6 !pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
                {stats.map((stat, index) => (
                  <div key={index} className="!text-center">
                    <div className={`!inline-flex !items-center !justify-center !w-10 !h-10 !rounded-xl !bg-${stat.color}-100 !mb-2`}>
                      <stat.icon className={`!w-5 !h-5 !text-${stat.color}-600`} />
                    </div>
                    <p className={`!text-lg !font-bold ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>{stat.value}</p>
                    <p className={`!text-xs ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:!col-span-2"
        >
          <div className={`!rounded-2xl !p-6 !border !shadow-lg ${
            isDark ? '!bg-gray-800/50 !border-gray-700' : '!bg-white !border-gray-200'
          }`}>
            <h3 className={`!text-lg !font-bold !mb-6 ${isDark ? '!text-gray-100' : '!text-gray-900'}`}>Información Personal</h3>
            
            <div className="!grid md:!grid-cols-2 !gap-6">
              {/* Name */}
              <div>
                <label className={`!flex !items-center !gap-2 !text-sm !font-medium !mb-2 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
                  <User className="!w-4 !h-4" />
                  Nombre Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className={`!w-full !px-4 !py-2.5 !rounded-xl !border focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !outline-none !transition-all ${
                      isDark ? '!border-gray-600 !bg-gray-700 !text-gray-100' : '!border-gray-300 !bg-white !text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`!px-4 !py-2.5 !rounded-xl ${isDark ? '!text-gray-100 !bg-gray-700/50' : '!text-gray-900 !bg-gray-50'}`}>{profile.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className={`!flex !items-center !gap-2 !text-sm !font-medium !mb-2 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
                  <Mail className="!w-4 !h-4" />
                  Correo Electrónico
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                    className={`!w-full !px-4 !py-2.5 !rounded-xl !border focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !outline-none !transition-all ${
                      isDark ? '!border-gray-600 !bg-gray-700 !text-gray-100' : '!border-gray-300 !bg-white !text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`!px-4 !py-2.5 !rounded-xl ${isDark ? '!text-gray-100 !bg-gray-700/50' : '!text-gray-900 !bg-gray-50'}`}>{profile.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className={`!flex !items-center !gap-2 !text-sm !font-medium !mb-2 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
                  <Phone className="!w-4 !h-4" />
                  Teléfono
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    className={`!w-full !px-4 !py-2.5 !rounded-xl !border focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !outline-none !transition-all ${
                      isDark ? '!border-gray-600 !bg-gray-700 !text-gray-100' : '!border-gray-300 !bg-white !text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`!px-4 !py-2.5 !rounded-xl ${isDark ? '!text-gray-100 !bg-gray-700/50' : '!text-gray-900 !bg-gray-50'}`}>{profile.phone}</p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className={`!flex !items-center !gap-2 !text-sm !font-medium !mb-2 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
                  <Building2 className="!w-4 !h-4" />
                  Empresa
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.company}
                    onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })}
                    className={`!w-full !px-4 !py-2.5 !rounded-xl !border focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !outline-none !transition-all ${
                      isDark ? '!border-gray-600 !bg-gray-700 !text-gray-100' : '!border-gray-300 !bg-white !text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`!px-4 !py-2.5 !rounded-xl ${isDark ? '!text-gray-100 !bg-gray-700/50' : '!text-gray-900 !bg-gray-50'}`}>{profile.company}</p>
                )}
              </div>

              {/* Position */}
              <div>
                <label className={`!flex !items-center !gap-2 !text-sm !font-medium !mb-2 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
                  <Award className="!w-4 !h-4" />
                  Cargo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.position}
                    onChange={(e) => setEditedProfile({ ...editedProfile, position: e.target.value })}
                    className={`!w-full !px-4 !py-2.5 !rounded-xl !border focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !outline-none !transition-all ${
                      isDark ? '!border-gray-600 !bg-gray-700 !text-gray-100' : '!border-gray-300 !bg-white !text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`!px-4 !py-2.5 !rounded-xl ${isDark ? '!text-gray-100 !bg-gray-700/50' : '!text-gray-900 !bg-gray-50'}`}>{profile.position}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className={`!flex !items-center !gap-2 !text-sm !font-medium !mb-2 ${isDark ? '!text-gray-300' : '!text-gray-700'}`}>
                  <MapPin className="!w-4 !h-4" />
                  Ubicación
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location}
                    onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                    className={`!w-full !px-4 !py-2.5 !rounded-xl !border focus:!ring-2 focus:!ring-green-500 focus:!border-green-500 !outline-none !transition-all ${
                      isDark ? '!border-gray-600 !bg-gray-700 !text-gray-100' : '!border-gray-300 !bg-white !text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`!px-4 !py-2.5 !rounded-xl ${isDark ? '!text-gray-100 !bg-gray-700/50' : '!text-gray-900 !bg-gray-50'}`}>{profile.location}</p>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className={`!mt-6 !pt-6 !border-t ${isDark ? '!border-gray-700' : '!border-gray-100'}`}>
              <div className={`!flex !items-center !gap-2 !text-sm ${isDark ? '!text-gray-400' : '!text-gray-500'}`}>
                <Calendar className="!w-4 !h-4" />
                <span>Miembro desde {profile.joinDate}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </div>
  );
};

export default ProfileView;
