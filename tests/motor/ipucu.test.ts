// İpucu üretimi testleri — bilimsel sadakat.
// Her cevaba, ipucu kataloğundaki etki büyüklükleri (DePaulo 2003) + kişilik temel çizgisi + koşullar
// üzerinden olasılıksal davranış betimlemeleri eklenir. Sınanan iddialar:
//   1) masumlar da ipucu üretir (Othello),
//   2) yalanda ipuçları katalogdaki yönde ve makul büyüklükte kayar; "ilişkisiz" olanlar kaymaz,
//   3) kaygılı masum sakin masumdan daha gergin görünür,
//   4) iyi yalancı daha az sızdırır,
//   5) sadece ipuçlarına bakan bot şansa yakın kalır (Bond & DePaulo 2006: ~%54).
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { vakaDurumuKur, cevapla } from '@motor/strateji';
import type { Cevap, VakaDurumu } from '@motor/strateji';
import { ipucuUret, YALAN_IFADE_TURLERI, temelCizgi } from '@motor/ipucu';
import type { IpucuGozlemi } from '@motor/ipucu';
import { ICERIK } from '@icerik/index';

const KATALOG = new Map(ICERIK.ipuclari.map((i) => [i.id, i]));

interface Ornek { durum: VakaDurumu; cevap: Cevap; gozlemler: IpucuGozlemi[]; kaygi: number; beceri: number }

/** 150 vaka × hayatta kişiler × 8 dilim kendi-konum sorusu → geniş örneklem. */
function ornekTopla(n = 150): Ornek[] {
  const sonuc: Ornek[] = [];
  for (let i = 0; i < n; i++) {
    const durum = vakaDurumuKur(vakaUret(`ipucu-${i}`));
    for (const k of durum.vaka.kisiler) {
      if (!k.hayatta) continue;
      for (let d = 0; d < durum.vaka.dilimler.length; d++) {
        const cevap = cevapla(durum, k.id, { tur: 'konum', hedef: k.id, dilim: d });
        sonuc.push({ durum, cevap, gozlemler: ipucuUret(durum, cevap), kaygi: k.kisilik.kaygi, beceri: k.yalanBecerisi });
      }
    }
  }
  return sonuc;
}

const ornekler = ornekTopla();
const yalanlar = ornekler.filter((o) => YALAN_IFADE_TURLERI.has(o.cevap.ifadeTuru));
const dogrular = ornekler.filter((o) => !YALAN_IFADE_TURLERI.has(o.cevap.ifadeTuru));

const oran = (grup: Ornek[], ipucuId: string) => grup.filter((o) => o.gozlemler.some((g) => g.ipucuId === ipucuId)).length / grup.length;

describe('ipucuUret — yapı', () => {
  it('deterministik: aynı cevap aynı gözlemleri verir', () => {
    const o = ornekler[0]!;
    expect(ipucuUret(o.durum, o.cevap)).toEqual(ipucuUret(o.durum, o.cevap));
  });

  it('her gözlem katalogdaki bir ipucuna ve onun betimlemelerinden birine işaret eder; aynı ipucu bir cevapta en fazla bir kez', () => {
    for (const o of ornekler.slice(0, 2000)) {
      const gorulen = new Set<string>();
      for (const g of o.gozlemler) {
        const kayit = KATALOG.get(g.ipucuId);
        expect(kayit, g.ipucuId).toBeDefined();
        expect(kayit!.betimlemeler).toContain(g.betimleme);
        expect(kayit!.kanal).toBe(g.kanal);
        expect(gorulen.has(g.ipucuId)).toBe(false);
        gorulen.add(g.ipucuId);
      }
    }
  });

  it('örneklem yeterince büyük ve her iki sınıf da dolu', () => {
    expect(yalanlar.length).toBeGreaterThan(400);
    expect(dogrular.length).toBeGreaterThan(2000);
  });
});

describe('ipucuUret — bilimsel sadakat', () => {
  it('masumlar da ipucu üretir: doğru cevapların en az %30\'unda bir gözlem var', () => {
    const ipuculu = dogrular.filter((o) => o.gozlemler.length > 0).length / dogrular.length;
    expect(ipuculu).toBeGreaterThan(0.3);
  });

  it('yalanda betimleme yönü "artar" olan ipuçları artar, "azalir" olanlar azalır, "iliskisiz" olanlar kaymaz', () => {
    for (const ipucu of ICERIK.ipuclari) {
      const fark = oran(yalanlar, ipucu.id) - oran(dogrular, ipucu.id);
      // Eşik gerekçesi: taban oran ~%16 ve beceri söndürmesiyle d=.30 teorik olarak ~0.05 fark üretir;
      // 750 yalanlık örneklemde standart hata ~0.013 → güçlü ipuçları için 0.03 tabanı, zayıflar için yalnızca yön.
      const guclu = Math.abs(ipucu.etkiBuyuklugu) >= 0.3;
      if (ipucu.betimlemeYonu === 'artar') {
        expect(fark, `${ipucu.id} artmalı`).toBeGreaterThan(guclu ? 0.03 : 0.005);
        expect(fark, `${ipucu.id} abartılı`).toBeLessThan(0.3);
      } else if (ipucu.betimlemeYonu === 'azalir') {
        expect(fark, `${ipucu.id} azalmalı`).toBeLessThan(guclu ? -0.03 : -0.005);
        expect(fark, `${ipucu.id} abartılı`).toBeGreaterThan(-0.3);
      } else {
        expect(Math.abs(fark), `${ipucu.id} ilişkisiz kalmalı`).toBeLessThan(0.04);
      }
    }
  });

  it('göz teması ve duraksama yalanla ilişkisiz kalır (mit)', () => {
    expect(Math.abs(oran(yalanlar, 'goz-temasi') - oran(dogrular, 'goz-temasi'))).toBeLessThan(0.04);
    expect(Math.abs(oran(yalanlar, 'duraksama') - oran(dogrular, 'duraksama'))).toBeLessThan(0.04);
  });

  it('Othello: kaygılı masum, sakin masumdan daha çok "genel gerginlik" gösterir', () => {
    const kaygili = dogrular.filter((o) => o.kaygi > 0.65);
    const sakin = dogrular.filter((o) => o.kaygi < 0.35);
    expect(kaygili.length).toBeGreaterThan(100);
    expect(sakin.length).toBeGreaterThan(100);
    expect(oran(kaygili, 'genel-gerginlik')).toBeGreaterThan(oran(sakin, 'genel-gerginlik') + 0.1);
  });

  it('iyi yalancı (beceri > .75) güçlü ipuçlarını kötü yalancıdan (< .35) daha az sızdırır', () => {
    const iyi = yalanlar.filter((o) => o.beceri > 0.75);
    const kotu = yalanlar.filter((o) => o.beceri < 0.35);
    expect(iyi.length).toBeGreaterThan(40);
    expect(kotu.length).toBeGreaterThan(40);
    const guclu = ICERIK.ipuclari.filter((i) => i.betimlemeYonu === 'artar' && Math.abs(i.etkiBuyuklugu) >= 0.3).map((i) => i.id);
    const ortalama = (grup: Ornek[]) => guclu.reduce((t, id) => t + oran(grup, id), 0) / guclu.length;
    expect(ortalama(iyi)).toBeLessThan(ortalama(kotu));
  });

  it('temelCizgi: kişiye özgü beklenen oranlar 0–1 aralığında ve içe dönük kişi daha çok göz kaçırır', () => {
    const durum = ornekler[0]!.durum;
    for (const k of durum.vaka.kisiler) {
      const tc = temelCizgi(durum, k.id);
      for (const [, p] of tc) { expect(p).toBeGreaterThanOrEqual(0); expect(p).toBeLessThanOrEqual(1); }
    }
    const icedonuk = { ...durum.vaka.kisiler[0]!, kisilik: { ...durum.vaka.kisiler[0]!.kisilik, disadonukluk: 0.1 } };
    const disadonuk = { ...durum.vaka.kisiler[0]!, kisilik: { ...durum.vaka.kisiler[0]!.kisilik, disadonukluk: 0.9 } };
    const durumI = { ...durum, vaka: { ...durum.vaka, kisiler: [icedonuk, ...durum.vaka.kisiler.slice(1)] } };
    const durumD = { ...durum, vaka: { ...durum.vaka, kisiler: [disadonuk, ...durum.vaka.kisiler.slice(1)] } };
    expect(temelCizgi(durumI, icedonuk.id).get('goz-temasi')!).toBeGreaterThan(temelCizgi(durumD, disadonuk.id).get('goz-temasi')!);
  });
});

describe('ipucuUret — denge: sadece ipuçlarına bakan bot', () => {
  it('"artar" ipucu gördüğünde yalan diyen botun dengeli doğruluğu %45–%65 arasında (şansa yakın)', () => {
    const artanlar = new Set(ICERIK.ipuclari.filter((i) => i.betimlemeYonu === 'artar').map((i) => i.id));
    let tp = 0, fn = 0, tn = 0, fp = 0;
    for (const o of ornekler) {
      const yalanDedi = o.gozlemler.filter((g) => artanlar.has(g.ipucuId)).length >= 1;
      const yalan = YALAN_IFADE_TURLERI.has(o.cevap.ifadeTuru);
      if (yalan && yalanDedi) tp++;
      else if (yalan && !yalanDedi) fn++;
      else if (!yalan && yalanDedi) fp++;
      else tn++;
    }
    const dengeli = (tp / (tp + fn) + tn / (tn + fp)) / 2;
    expect(dengeli).toBeGreaterThan(0.45);
    expect(dengeli).toBeLessThan(0.65);
  });

  it('"mit" ipuçlarına (göz teması, duraksama, gecikme) bakan bot tam şans düzeyinde (±%4)', () => {
    const mitler = new Set(['goz-temasi', 'duraksama', 'cevap-gecikmesi', 'ayak-el-kipirdanma']);
    let tp = 0, fn = 0, tn = 0, fp = 0;
    for (const o of ornekler) {
      const yalanDedi = o.gozlemler.some((g) => mitler.has(g.ipucuId));
      const yalan = YALAN_IFADE_TURLERI.has(o.cevap.ifadeTuru);
      if (yalan && yalanDedi) tp++; else if (yalan) fn++; else if (yalanDedi) fp++; else tn++;
    }
    const dengeli = (tp / (tp + fn) + tn / (tn + fp)) / 2;
    expect(Math.abs(dengeli - 0.5)).toBeLessThan(0.04);
  });
});
