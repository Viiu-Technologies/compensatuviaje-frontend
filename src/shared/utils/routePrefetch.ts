// ==========================================================================
// routePrefetch.ts — Intelligent route prefetching to eliminate navigation lag
// ==========================================================================

export const prefetchRoutes = {
  calculator: () => import('../../apps/public/pages/CalculatorPage'),
  contact: () => import('../../apps/public/pages/ContactPage'),
  payments: () => import('../../apps/public/pages/PaymentMethodsPage'),
  blog: () => import('../../apps/public/pages/BlogPage'),
  partners: () => import('../../apps/public/pages/PartnersGuidePage'),
  login: () => import('../../apps/auth/pages/LoginPage'),
  register: () => import('../../apps/auth/pages/RegisterPage'),
};

export type PrefetchKey = keyof typeof prefetchRoutes;

const prefetchedCache = new Set<string>();

export function prefetchRoute(key: PrefetchKey) {
  if (prefetchedCache.has(key)) return;
  prefetchedCache.add(key);
  try {
    prefetchRoutes[key]();
  } catch (err) {
    // Ignore prefetch errors silently
    console.debug(`[Prefetch] Failed for route ${key}:`, err);
  }
}

export function scheduleIdlePrefetch() {
  if (typeof window === 'undefined') return;

  const prefetchPublicPages = () => {
    prefetchRoute('calculator');
    prefetchRoute('payments');
    prefetchRoute('contact');
    prefetchRoute('blog');
    prefetchRoute('partners');
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(
      () => {
        prefetchPublicPages();
      },
      { timeout: 2500 }
    );
  } else {
    setTimeout(prefetchPublicPages, 1200);
  }
}
