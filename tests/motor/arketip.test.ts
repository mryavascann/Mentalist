// Vaka arketip havuzu (TASARIM §15): mekâna göre karıştırılır, kalıp oluşturmaz, brifinge renk katar.
import { describe, it, expect } from 'vitest';
import { ARKETIPLER, mekanaUygunArketipler } from '@motor/arketipler';
import { vakaUret } from '@motor/gerceklik';
import { vakaBrifingi } from '@motor/dil';
import { ICERIK } from '@icerik/index';
import { MEKAN_SABLONLARI } from '@motor/havuzlar';

describe('arketip havuzu', () => {
  it('her mekân türü için en az 2 arketip; idler benzersiz; Kılavuz bağları çözülür; kaza arketipleri motivasyonsuz', () => {
    const idler = ARKETIPLER.map((a) => a.id);
    expect(new Set(idler).size).toBe(idler.length);
    const kilavuz = new Set(ICERIK.kilavuz.map((m) => m.id));
    for (const a of ARKETIPLER) {
      if (a.kilavuzMaddesi) expect(kilavuz.has(a.kilavuzMaddesi), a.id).toBe(true);
      if (a.olayTuru === 'kaza') expect(a.motivasyonlar).toEqual([]);
      else expect(a.motivasyonlar.length).toBeGreaterThan(0);
      expect(a.yontemler.length).toBeGreaterThan(0);
      expect(a.brifingEki.length).toBeGreaterThan(10);
    }
    for (const m of MEKAN_SABLONLARI) expect(mekanaUygunArketipler(m.tur).length, m.tur).toBeGreaterThanOrEqual(2);
  });
});

describe('vakaUret ile arketip', () => {
  const vakalar = Array.from({ length: 400 }, (_, i) => vakaUret(`arketip-${i}`));

  it('her vakanın arketipi mekânına uygun; olay türü ve yöntem arketipten gelir', () => {
    for (const v of vakalar) {
      const a = ARKETIPLER.find((x) => x.id === v.arketip)!;
      expect(a, v.seed).toBeDefined();
      expect(a.mekanlar).toContain(v.mekan.tur);
      expect(a.olayTuru).toBe(v.olay.tur);
      expect(a.yontemler).toContain(v.olay.yontem);
      if (v.olay.fail) expect(v.olay.motivasyon.length).toBeGreaterThan(0);
    }
  });

  it('kaza oranı %3–25 arasında kalır; en az 8 farklı arketip görülür; hiçbir arketip %35\'i geçmez', () => {
    const kaza = vakalar.filter((v) => !v.olay.fail).length / vakalar.length;
    expect(kaza).toBeGreaterThan(0.03);
    expect(kaza).toBeLessThan(0.25);
    const sayac = new Map<string, number>();
    for (const v of vakalar) sayac.set(v.arketip, (sayac.get(v.arketip) ?? 0) + 1);
    expect(sayac.size).toBeGreaterThanOrEqual(8);
    for (const [id, n] of sayac) expect(n / vakalar.length, id).toBeLessThan(0.35);
  });

  it('brifing arketip cümlesini içerir ve fail adı geçmez', () => {
    for (const v of vakalar.slice(0, 60)) {
      const a = ARKETIPLER.find((x) => x.id === v.arketip)!;
      const b = vakaBrifingi(v);
      expect(b).toContain(a.brifingEki);
      if (v.olay.fail) expect(b).not.toContain(v.kisiler.find((k) => k.id === v.olay.fail)!.ad.split(' ')[0]!);
    }
  });

  it('arketip fail seçimiyle ilişkisiz: fail yine kurban dışı adaylar arasında düzgün dağılır', () => {
    const konum = new Map<number, number>();
    let n = 0;
    for (const v of vakalar) {
      if (!v.olay.fail) continue;
      const adaylar = v.kisiler.filter((k) => k.id !== v.olay.kurban);
      const kova = Math.floor((adaylar.findIndex((k) => k.id === v.olay.fail) / adaylar.length) * 4);
      konum.set(kova, (konum.get(kova) ?? 0) + 1);
      n++;
    }
    for (let k = 0; k < 4; k++) { const pay = (konum.get(k) ?? 0) / n; expect(pay).toBeGreaterThan(0.15); expect(pay).toBeLessThan(0.35); }
  });
});
