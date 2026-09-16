// Ayna arkı (TASARIM §14, K-013 devamı): Ayna vakaları sıradan vakalardan farklı üretilir ve ark boyunca birikir.
//   1. `ayar.ayna` bayrağı manipülasyon/sahne arketiplerinin ağırlığını artırır; mekân ve kişiler değişmez
//      (aynı seed → aynı insanlar; yalnızca "ne oldu" rengi değişir). Fail seçimiyle ilgisi yoktur.
//   2. Not, karşılaşma sayısına ve önceki sonuca göre değişir: ilk karşılaşma tanışma; sonrakiler "geçen sefer"i alıntılar.
//   3. Okunma oranı geçmişten hesaplanır (kör nokta bölümünde gösterilir).
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { AYNA_ARKETIPLERI, AYNA_ARKETIP_CARPANI, aynaTahmini, aynaNotu, aynaArkOzeti, aynaOkunmaOrani } from '@motor/ayna';
import { ARKETIPLER } from '@motor/arketipler';

const KOR = (etiket: string, sayi = 3) => [{ etiket, sayi }];

describe('Ayna arketip ağırlığı', () => {
  it('AYNA_ARKETIPLERI havuzda var ve her mekân türü için en az bir Ayna arketipi bulunur', () => {
    expect(AYNA_ARKETIP_CARPANI).toBeGreaterThan(1);
    expect(AYNA_ARKETIPLERI.length).toBeGreaterThanOrEqual(3);
    const idler = new Set(ARKETIPLER.map((a) => a.id));
    for (const id of AYNA_ARKETIPLERI) expect(idler.has(id), id).toBe(true);
    const mekanlar = new Set(ARKETIPLER.flatMap((a) => a.mekanlar));
    for (const m of mekanlar) expect(ARKETIPLER.some((a) => AYNA_ARKETIPLERI.includes(a.id) && a.mekanlar.includes(m)), m).toBe(true);
  });

  it('ayna bayrağı Ayna arketiplerinin payını belirgin artırır; mekân, kişiler ve kurban aynı kalır', () => {
    let normal = 0, ayna = 0;
    const N = 300;
    for (let i = 0; i < N; i++) {
      const a = vakaUret(`ayna-ark-${i}`);
      const b = vakaUret(`ayna-ark-${i}`, { zorluk: 'orta', ayna: true });
      if (AYNA_ARKETIPLERI.includes(a.arketip)) normal++;
      if (AYNA_ARKETIPLERI.includes(b.arketip)) ayna++;
      expect(b.mekan).toEqual(a.mekan);
      expect(b.kisiler.map((k) => k.id + k.ad)).toEqual(a.kisiler.map((k) => k.id + k.ad));
      expect(b.olay.kurban).toBe(a.olay.kurban);
      expect(b.ayar.ayna).toBe(true);
      expect(a.ayar.ayna).toBeUndefined();
    }
    expect(ayna / N).toBeGreaterThan(normal / N + 0.25);
    expect(ayna / N).toBeLessThan(0.95); // her Ayna vakası aynı kalıp olmasın
  });

  it('örüntü denetimi: Ayna vakasında da tahmin faille şans düzeyinde', () => {
    let tuttu = 0, beklenen = 0, n = 0;
    for (let i = 0; i < 200; i++) {
      const vaka = vakaUret(`ayna-ark-oruntu-${i}`, { zorluk: 'orta', ayna: true });
      if (!vaka.olay.fail) continue;
      n++;
      beklenen += 1 / vaka.kisiler.filter((k) => k.hayatta && k.id !== vaka.olay.kurban).length;
      if (aynaTahmini(vaka, KOR('othello-hatasi')).tahmin === vaka.olay.fail) tuttu++;
    }
    expect(tuttu / n).toBeLessThan(beklenen / n + 0.12);
  });
});

describe('Ayna ark notu ve okunma oranı', () => {
  const gecmis = (ayna: ({ okundu: boolean } | null)[]) => ayna.map((a, i) => ({ seed: `g-${i}`, dogru: false, puan: 20, hataEtiketleri: ['othello-hatasi'], brier: 0.5, ...(a ? { ayna: { etiket: 'othello-hatasi', okundu: a.okundu, not: `not-${i}` } } : {}) }));

  it('ark özeti: karşılaşma sayısı, son sonuç ve önceki notlar geçmişten türer', () => {
    expect(aynaArkOzeti(gecmis([null, null]))).toEqual({ karsilasma: 0, sonOkundu: null, notlar: [] });
    const o = aynaArkOzeti(gecmis([null, { okundu: true }, null, { okundu: false }]));
    expect(o.karsilasma).toBe(2);
    expect(o.sonOkundu).toBe(false);
    expect(o.notlar).toEqual(['not-1', 'not-3']);
    expect(aynaOkunmaOrani(gecmis([null, { okundu: true }, { okundu: false }, { okundu: true }]))).toEqual({ n: 3, okundu: 2 });
    expect(aynaOkunmaOrani(gecmis([null]))).toEqual({ n: 0, okundu: 0 });
  });

  it('ilk karşılaşma tanışma tonunda; sonraki notlar önceki sonucu alıntılar; kahraman adı var, tahmin edilen kişinin adı yok; deterministik', () => {
    const vaka = vakaUret('ayna-ark-not', { zorluk: 'orta', ayna: true });
    const t = aynaTahmini(vaka, KOR('othello-hatasi'));
    const ad = vaka.kisiler.find((k) => k.id === t.tahmin)!.ad;
    const ilk = aynaNotu(vaka, 'Deniz', t, { karsilasma: 0, sonOkundu: null, notlar: [] });
    const okundu = aynaNotu(vaka, 'Deniz', t, { karsilasma: 1, sonOkundu: true, notlar: ['x'] });
    const yanildi = aynaNotu(vaka, 'Deniz', t, { karsilasma: 2, sonOkundu: false, notlar: ['x', 'y'] });
    for (const n of [ilk, okundu, yanildi]) {
      expect(n).toContain('Deniz');
      expect(n).not.toContain(ad);
      expect(n).not.toMatch(/undefined|NaN/);
    }
    expect(ilk).not.toMatch(/geçen sefer/i);
    expect(okundu).toMatch(/geçen sefer/i);
    expect(okundu).toMatch(/okudum|bildim|tuttu/i);
    expect(yanildi).toMatch(/geçen sefer/i);
    expect(yanildi).toMatch(/şaşırttın|yanıldım|kaçırdım/i);
    expect(okundu).not.toBe(yanildi);
    expect(aynaNotu(vaka, 'Deniz', t, { karsilasma: 1, sonOkundu: true, notlar: ['x'] })).toBe(okundu);
    // Ark özeti verilmezse ilk karşılaşma gibi davranır (geriye uyumluluk).
    expect(aynaNotu(vaka, 'Deniz', t)).toBe(ilk);
  });
});
