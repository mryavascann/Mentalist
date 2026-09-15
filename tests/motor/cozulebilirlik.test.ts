// Çözülebilirlik ve örüntü denetçisi testleri.
// Her vaka meşru sinyallerle (delil çelişkisi, geçerli CIT, koruması olmayan görgü tanığı, beklenmedik soru)
// tek faile inmeli; kaza vakasında "suç yok" sonucuna ulaşılabilmeli. Ve failin yüzeysel özelliklerle
// (sıra, kişilik, yaş, cinsiyet, ilişki sayısı, sır, delil sayısı) istatistiksel ilişkisi olmamalı.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { sorguBaslat } from '@motor/teknik';
import { cozulebilirlikDenetle, vakaUretCozulebilir, oruntuDenetle } from '@motor/cozulebilirlik';

const seedler = Array.from({ length: 300 }, (_, i) => `coz-${i}`);

describe('cozulebilirlikDenetle', () => {
  const raporlar = seedler.map((s) => {
    const sorgu = sorguBaslat(vakaUret(s));
    return { s, sorgu, rapor: cozulebilirlikDenetle(sorgu) };
  });

  it('deterministik ve yapısal olarak tutarlı', () => {
    const q = sorguBaslat(vakaUret('coz-det'));
    expect(cozulebilirlikDenetle(q)).toEqual(cozulebilirlikDenetle(sorguBaslat(vakaUret('coz-det'))));
    for (const { rapor, sorgu } of raporlar) {
      expect(rapor.zorluk).toBeGreaterThanOrEqual(0);
      expect(rapor.zorluk).toBeLessThanOrEqual(1);
      const idler = new Set(sorgu.durum.vaka.kisiler.map((k) => k.id));
      for (const s of rapor.supheliler) expect(idler.has(s)).toBe(true);
      expect(Array.isArray(rapor.sinyaller)).toBe(true);
    }
  });

  it('fail varsa her zaman şüpheliler arasındadır; çözülebilir vakada sinyal listesi boş değil', () => {
    for (const { rapor, sorgu, s } of raporlar) {
      const f = sorgu.durum.vaka.olay.fail;
      if (!f) continue;
      expect(rapor.supheliler, s).toContain(f);
      if (rapor.cozulebilir) expect(rapor.sinyaller.length, s).toBeGreaterThan(0);
    }
  });

  it('suç vakalarının büyük çoğunluğu çözülebilir (>%80); kaza vakaları "suç yok" olarak çözülebilir', () => {
    const suc = raporlar.filter((r) => r.sorgu.durum.vaka.olay.fail);
    const kaza = raporlar.filter((r) => !r.sorgu.durum.vaka.olay.fail);
    expect(suc.filter((r) => r.rapor.cozulebilir).length / suc.length).toBeGreaterThan(0.8);
    for (const r of kaza) { expect(r.rapor.cozulebilir).toBe(true); expect(r.rapor.sucVar).toBe(false); }
  });

  it('tek çözüm: çözülebilir suç vakasında sinyaller yalnızca faili işaret eder', () => {
    for (const { rapor, sorgu } of raporlar) {
      if (!sorgu.durum.vaka.olay.fail || !rapor.cozulebilir) continue;
      expect(rapor.tekCozum).toBe(true);
    }
  });

  it('zorluk dağılımı geniş: kolay ve zor vakalar var', () => {
    const z = raporlar.filter((r) => r.sorgu.durum.vaka.olay.fail).map((r) => r.rapor.zorluk);
    expect(Math.min(...z)).toBeLessThan(0.35);
    expect(Math.max(...z)).toBeGreaterThan(0.6);
  });

  it('görgü tanığı varsa vaka daha kolay; fail kaçamak veriyorsa daha zor', () => {
    let tanikli = 0, tanikliN = 0, taniksiz = 0, taniksizN = 0;
    for (const { rapor } of raporlar) {
      if (!rapor.sucVar) continue;
      if (rapor.sinyaller.some((x) => x.tur === 'gorgu-tanigi')) { tanikli += rapor.zorluk; tanikliN++; }
      else { taniksiz += rapor.zorluk; taniksizN++; }
    }
    expect(tanikliN).toBeGreaterThan(10);
    expect(tanikli / tanikliN).toBeLessThan(taniksiz / taniksizN);
  });
});

describe('vakaUretCozulebilir', () => {
  it('her zaman çözülebilir vaka döner ve seed türetimi deterministik', () => {
    for (let i = 0; i < 80; i++) {
      const a = vakaUretCozulebilir(`garanti-${i}`);
      const b = vakaUretCozulebilir(`garanti-${i}`);
      expect(a.vaka.seed).toBe(b.vaka.seed);
      expect(a.rapor.cozulebilir).toBe(true);
      expect(a.deneme).toBeGreaterThanOrEqual(1);
      expect(a.deneme).toBeLessThanOrEqual(10);
    }
  });
});

describe('oruntuDenetle — kalıp yok', () => {
  const vakalar = Array.from({ length: 800 }, (_, i) => vakaUret(`oruntu-tam-${i}`));
  const rapor = oruntuDenetle(vakalar);

  it('her yüzeysel özelliğin fail ile korelasyonu küçük (|r| < .08)', () => {
    expect(rapor.ozellikler.length).toBeGreaterThanOrEqual(10);
    for (const o of rapor.ozellikler) expect(Math.abs(o.r), `${o.ad}: r=${o.r.toFixed(3)}`).toBeLessThan(0.08);
    expect(rapor.enBuyukMutlakR).toBeLessThan(0.08);
  });

  it('"kişi başı delil sayısı en yüksek olan fail" kestirmesi %60 altında', () => {
    expect(rapor.delilSayisiKestirmesiDogrulugu).toBeLessThan(0.6);
  });

  it('"listede ilk / son kişi" kestirmeleri şans civarında', () => {
    expect(rapor.ilkKisiDogrulugu).toBeLessThan(0.3);
    expect(rapor.sonKisiDogrulugu).toBeLessThan(0.3);
  });
});
