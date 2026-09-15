// Duman testi: test altyapısı, takma adlar ve en temel modül çalışıyor mu?
// Bu dosya her zaman yeşil kalmalı; kırmızıysa sorun kodda değil kurulumdadır.
import { describe, it, expect } from 'vitest';
import { PROJE, surumMetni } from '@ortak/surum';

describe('kurulum duman testi', () => {
  it('proje kimliği tanımlı', () => {
    expect(PROJE.ad.length).toBeGreaterThan(0);
    expect(PROJE.surum).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('sürüm metni "Ad vX.Y.Z" biçiminde', () => {
    expect(surumMetni()).toBe(`${PROJE.ad} v${PROJE.surum}`);
  });
});
