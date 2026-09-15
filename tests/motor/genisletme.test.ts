// Şablon havuzu ve mekâna özgü delil türleri (Aşama 3 genişletme).
//  - Dil şablonları: her kategoride en az 5 varyant; aynı kişiden aynı türde 8 cevapta en az 3 farklı iskelet.
//  - Mekâna özgü belgeler: hastanede ilaç kayıt defteri, motelde resepsiyon defteri, ofiste kart geçiş kaydı…
import { describe, it, expect } from 'vitest';
import { SABLON_KATEGORILERI, sablonSayisi } from '@motor/dil';
import { vakaUret } from '@motor/gerceklik';
import { bilgiDagit } from '@motor/bilgi';
import { delilUret, MEKAN_BELGELERI } from '@motor/delil';
import type { MekanTuru } from '@motor/tipler';

describe('şablon havuzu', () => {
  it('her kategoride en az 5 varyant ve en az 20 kategori', () => {
    expect(SABLON_KATEGORILERI.length).toBeGreaterThanOrEqual(20);
    for (const k of SABLON_KATEGORILERI) expect(sablonSayisi(k), k).toBeGreaterThanOrEqual(5);
  });
});

describe('mekâna özgü belgeler', () => {
  it('her mekân türü için en az 2 belge tanımlı ve belge metinleri ayırt edici', () => {
    const turler: MekanTuru[] = ['malikane', 'ofis', 'sahil-evi', 'ciftlik', 'hastane', 'motel', 'karnaval', 'apartman'];
    for (const t of turler) expect(MEKAN_BELGELERI[t].length, t).toBeGreaterThanOrEqual(2);
    expect(MEKAN_BELGELERI.hastane.some((b) => /ilaç/i.test(b))).toBe(true);
    expect(MEKAN_BELGELERI.motel.some((b) => /resepsiyon/i.test(b))).toBe(true);
    expect(MEKAN_BELGELERI.ofis.some((b) => /kart|geçiş/i.test(b))).toBe(true);
  });

  it('belge delilleri mekânın kendi listesinden gelir (200 vaka)', () => {
    let belge = 0;
    for (let i = 0; i < 200; i++) {
      const v = vakaUret(`mekan-belge-${i}`);
      const deliller = delilUret(v, bilgiDagit(v));
      for (const d of deliller) {
        if (d.tur !== 'belge') continue;
        belge++;
        expect(MEKAN_BELGELERI[v.mekan.tur].some((b) => d.aciklama.includes(b)), `${v.mekan.tur}: ${d.aciklama}`).toBe(true);
      }
    }
    expect(belge).toBeGreaterThan(40);
  });
});
