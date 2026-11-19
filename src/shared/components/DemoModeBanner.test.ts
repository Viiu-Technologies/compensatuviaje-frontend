import { describe, expect, test } from 'vitest';
import { isDemoNoticeRoute } from './DemoModeBanner';

describe('isDemoNoticeRoute', () => {
  test('aparece en pago y certificados', () => {
    for (const p of ['/b2c/projects', '/b2c/payment-result', '/b2c/certificates', '/b2c/nft-certificates', '/verify/abc', '/verify/token/12', '/verificar/CERT-1']) {
      expect(isDemoNoticeRoute(p)).toBe(true);
    }
  });

  test('no aparece en la portada ni en los paneles', () => {
    for (const p of ['/', '/b2c/dashboard', '/b2b/dashboard', '/admin/orders', '/partner/home', '/calculadora', '/blog', '/b2c/projectsx', '/verify']) {
      expect(isDemoNoticeRoute(p)).toBe(false);
    }
  });
});
