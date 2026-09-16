// "İkinci kez sor" mekaniği (Swerts 2013: üstüne gelinince tekrar söylenen yalan daha çok ipucu verir; DePaulo:
// kasıtlı çaba ironik biçimde ele verir). Aynı soru tekrar sorulunca cevap DEĞİŞMEZ (yalan defteri, Vrij 2010) ama
// gözlemler yeniden çekilir ve yalan kayması küçük bir çarpanla büyür; doğru cevapta kayma yoktur.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat, sor, TEKRAR_CARPANI, type Sorgu } from '@motor/teknik';

const seedler = Array.from({ length: 200 }, (_, i) => `tekrar-${i}`);
const yeni = (s: string): Sorgu => sorguBaslat(vakaUret(s));
const canlilar = (q: Sorgu) => q.durum.vaka.kisiler.filter((k) => k.hayatta && k.id !== q.durum.vaka.olay.kurban);

describe('tekrar sorma', () => {
  it('sayaç artar, sonuç kaçıncı soruş olduğunu söyler; cevap aynı kalır; çarpan küçük (1 < c ≤ 1.5)', () => {
    expect(TEKRAR_CARPANI).toBeGreaterThan(1);
    expect(TEKRAR_CARPANI).toBeLessThanOrEqual(1.5);
    const q = yeni('tekrar-sayac');
    const k = canlilar(q)[0]!.id;
    const soru = { tur: 'konum' as const, hedef: k, dilim: 1 };
    const a = sor(q, k, soru);
    const b = sor(q, k, soru);
    const c = sor(q, k, soru);
    expect(a.tekrar).toBe(1);
    expect(b.tekrar).toBe(2);
    expect(c.tekrar).toBe(3);
    expect(b.cevap).toEqual(a.cevap);
    expect(q.soruSayaci.get(`${k}|konum:${k}:1`)).toBe(3);
    // Farklı soru ayrı sayılır.
    expect(sor(q, k, { tur: 'konum', hedef: k, dilim: 2 }).tekrar).toBe(1);
  });

  it('failin gömülü yalanında ikinci soruş daha çok ipucu verir (oran 1.0–1.6); doğru cevapta değişmez (0.85–1.15)', () => {
    let ilkYalan = 0, ikinciYalan = 0, yalanN = 0, ilkDogru = 0, ikinciDogru = 0, dogruN = 0;
    for (const s of seedler) {
      const q = yeni(s);
      const { fail, dilim } = q.durum.vaka.olay;
      for (const k of canlilar(q)) {
        const soru = { tur: 'konum' as const, hedef: k.id, dilim };
        const ilk = sor(q, k.id, soru);
        const ikinci = sor(q, k.id, soru);
        if (k.id === fail && ilk.cevap.ifadeTuru === 'gomulu-yalan') { yalanN++; ilkYalan += ilk.ipuclari.length; ikinciYalan += ikinci.ipuclari.length; }
        else if (ilk.cevap.ifadeTuru === 'dogru') { dogruN++; ilkDogru += ilk.ipuclari.length; ikinciDogru += ikinci.ipuclari.length; }
      }
    }
    expect(yalanN).toBeGreaterThan(30);
    expect(dogruN).toBeGreaterThan(150);
    expect(ikinciYalan / ilkYalan).toBeGreaterThan(1.0);
    expect(ikinciYalan / ilkYalan).toBeLessThan(1.6);
    expect(ikinciDogru / ilkDogru).toBeGreaterThan(0.85);
    expect(ikinciDogru / ilkDogru).toBeLessThan(1.15);
  });
});
