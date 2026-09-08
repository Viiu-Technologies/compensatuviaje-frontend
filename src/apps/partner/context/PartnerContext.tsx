// ============================================
// PARTNER CONTEXT
// Fuente de verdad compartida para profile/onboarding/kybStatus.
//
// Antes de este contexto, PartnerLayout, PartnerDashboard y PartnerProfile
// mantenían cada uno su propia copia de este mismo estado, cargada una sola
// vez al montar (useEffect con deps []). Resultado: al completar un paso de
// onboarding o subir el dossier KYB, solo se refrescaba el estado local de
// la página activa — el layout (dueño del "doble candado" de navegación)
// nunca se enteraba sin un F5.
//
// Este contexto resuelve dos casos:
// 1. El propio partner completa un paso (perfil, logo, KYB) -> cualquier
//    página puede llamar a refetch() y todos los consumidores (incluido el
//    layout) ven el cambio de inmediato, sin recargar.
// 2. Un admin aprueba/rechaza el KYB de forma asíncrona mientras el partner
//    tiene la pestaña abierta -> polling ligero (solo mientras el KYB no
//    esté en un estado final) más revalidación al recuperar el foco de la
//    ventana detectan el cambio sin intervención del usuario.
// ============================================

import React, { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { getPartnerProfile, getOnboardingStatus } from '../services/partnerApi';
import kybApi from '../services/kybApi';
import { getKybVisualStatus } from '../../../types/kyb.types';
import type { KybStatusResponse } from '../../../types/kyb.types';
import type { PartnerProfile, OnboardingStatus } from '../../../types/partner.types';

const KYB_POLL_INTERVAL_MS = 30000;

interface PartnerContextValue {
  profile: PartnerProfile | null;
  onboarding: OnboardingStatus | null;
  kybStatus: KybStatusResponse | null;
  /** true mientras se resuelve la primera carga */
  loading: boolean;
  /** true una vez que la primera carga (éxito o error) terminó */
  isDataLoaded: boolean;
  /** NIVEL 1 del doble candado: onboarding.completed === true */
  isProfileComplete: boolean;
  /** NIVEL 2 del doble candado: admin_decision === 'approved' */
  isKybVerified: boolean;
  /** Vuelve a pedir profile + onboarding + kybStatus al backend y actualiza el estado compartido */
  refetch: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextValue | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);
  const [kybStatus, setKybStatus] = useState<KybStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const isProfileComplete = onboarding?.completed === true;
  const isKybVerified = getKybVisualStatus(kybStatus?.latest_evaluation ?? null) === 'approved';

  const fetchAll = useCallback(async () => {
    const results = await Promise.allSettled([
      getPartnerProfile(),
      getOnboardingStatus(),
      kybApi.getStatus(),
    ]);
    if (results[0].status === 'fulfilled') setProfile(results[0].value);
    if (results[1].status === 'fulfilled') setOnboarding(results[1].value);
    if (results[2].status === 'fulfilled') setKybStatus(results[2].value);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const endpoints = ['profile', 'onboarding', 'kybStatus'];
        console.warn(`[PartnerContext] Error loading ${endpoints[index]}:`, result.reason);
      }
    });
  }, []);

  const refetch = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  // Carga inicial
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAll();
      setLoading(false);
      setIsDataLoaded(true);
    })();
  }, [fetchAll]);

  // Polling ligero: solo mientras el KYB no llegó a un estado final
  // (aprobado o rechazado por el admin), para detectar la decisión del
  // admin sin que el partner tenga que refrescar. Una vez resuelto, se
  // detiene solo — no tiene sentido seguir consultando cada 30s.
  const kybEvaluation = kybStatus?.latest_evaluation ?? null;
  const kybPending = isDataLoaded && kybEvaluation !== null && kybEvaluation.admin_decision === null;
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (kybPending) {
      pollingRef.current = setInterval(() => {
        fetchAll();
      }, KYB_POLL_INTERVAL_MS);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [kybPending, fetchAll]);

  // Revalidar al volver a la pestaña/ventana: cubre el caso de que el admin
  // haya aprobado mientras el partner estaba en otra pestaña o app.
  useEffect(() => {
    const handleFocus = () => {
      if (isDataLoaded) fetchAll();
    };
    // Nombrado (no inline) para poder removerlo en el cleanup -- la version anterior
    // pasaba una funcion anonima a addEventListener, asi que este listener nunca se
    // limpiaba: cada montaje de PartnerProvider dejaba uno huerfano corriendo para
    // siempre, cada uno disparando fetchAll() (3 requests) en cada cambio de pestaña.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') handleFocus();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isDataLoaded, fetchAll]);

  // Sin memoizar, este objeto era una referencia nueva en cada render de
  // PartnerProvider -- cualquier consumidor envuelto en React.memo bajo /partner/*
  // perdia el beneficio de la memoizacion sin razon aparente.
  const value = useMemo<PartnerContextValue>(
    () => ({
      profile,
      onboarding,
      kybStatus,
      loading,
      isDataLoaded,
      isProfileComplete,
      isKybVerified,
      refetch,
    }),
    [profile, onboarding, kybStatus, loading, isDataLoaded, isProfileComplete, isKybVerified, refetch]
  );

  return (
    <PartnerContext.Provider value={value}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartnerContext = (): PartnerContextValue => {
  const ctx = useContext(PartnerContext);
  if (ctx === undefined) {
    throw new Error('usePartnerContext debe usarse dentro de un PartnerProvider');
  }
  return ctx;
};

export default PartnerContext;
