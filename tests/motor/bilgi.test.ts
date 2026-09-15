// Bilgi dağılımı ve algı modeli testleri.
// "Kim neyi NASIL biliyor?" katmanı: gördü / duydu / dedikodu / medya / kendisi.
// Bu katman gizli bilgi testinin (CIT) geçerliliğini belirler: ayrıntı medyaya sızdıysa
// masum da bilir ve test geçersizdir (Vrij & Verschuere 2014). Dikkat boşluğu (Simons & Chabris 1999):
// aynı odada olmak görmek demek değildir.
import { describe, it, expect } from 'vitest';
import { vakaUret, DILIM_SAYISI } from '@motor/gerceklik';
import { bilgiDagit, citGecerliMi, kimBiliyor, DIKKAT_DAGITAN_EYLEMLER } from '@motor/bilgi';
import type { Bilgi } from '@motor/bilgi';

const seedler = Array.from({ length: 80 }, (_, i) => `bilgi-${i}`);
const ornekler = seedler.map((s) => {
  const vaka = vakaUret(s);
  return { seed: s, vaka, dagilim: bilgiDagit(vaka) };
});

const konumGercegi = (o: (typeof ornekler)[number], kisi: string, dilim: number) =>
  o.vaka.zamanCizelgesi.find((z) => z.kisi === kisi && z.dilim === dilim)!.oda;

describe('bilgiDagit — temel', () => {
  it('aynı vaka için deterministik', () => {
    const v = vakaUret('det');
    expect(bilgiDagit(v)).toEqual(bilgiDagit(v));
  });

  it('her bilgi geçerli kişiye, geçerli kaynağa ve geçerli konuya sahip', () => {
    for (const o of ornekler) {
      const idler = new Set(o.vaka.kisiler.map((k) => k.id));
      for (const b of o.dagilim.bilgiler) {
        expect(idler.has(b.kisi)).toBe(true);
        expect(['gordu', 'duydu', 'dedikodu', 'medya', 'kendisi']).toContain(b.kaynak);
        expect(['olay-yeri', 'olay-zamani', 'olay-yontemi', 'fail-kimligi', 'konum']).toContain(b.konu);
        if (b.konu === 'konum') {
          expect(idler.has(b.hedefKisi!)).toBe(true);
          expect(b.hedefDilim).toBeGreaterThanOrEqual(0);
          expect(b.hedefDilim).toBeLessThan(DILIM_SAYISI);
        }
      }
    }
  });

  it('fail olayın dört konusunu da "kendisi" kaynağıyla bilir', () => {
    for (const o of ornekler) {
      if (!o.vaka.olay.fail) continue;
      for (const konu of ['olay-yeri', 'olay-zamani', 'olay-yontemi', 'fail-kimligi'] as const) {
        const b = o.dagilim.bilgiler.find((x) => x.kisi === o.vaka.olay.fail && x.konu === konu);
        expect(b, `${o.seed}: fail ${konu} bilmiyor`).toBeDefined();
        expect(b!.kaynak).toBe('kendisi');
        expect(b!.dogru).toBe(true);
      }
    }
  });

  it('olay yeri ve zamanı kamuya açık: hayatta olan herkes bilir', () => {
    for (const o of ornekler) {
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta) continue;
        expect(kimBiliyor(o.dagilim, 'olay-yeri')).toContain(k.id);
        expect(kimBiliyor(o.dagilim, 'olay-zamani')).toContain(k.id);
      }
    }
  });

  it('herkes kendi konumunu her dilimde "kendisi" kaynağıyla bilir', () => {
    for (const o of ornekler.slice(0, 20)) {
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta) continue;
        for (let d = 0; d < DILIM_SAYISI; d++) {
          const b = o.dagilim.bilgiler.find((x) => x.kisi === k.id && x.konu === 'konum' && x.hedefKisi === k.id && x.hedefDilim === d);
          expect(b, `${o.seed}: ${k.id} kendi konumunu bilmiyor (dilim ${d})`).toBeDefined();
          expect(b!.kaynak).toBe('kendisi');
          expect(b!.icerik).toBe(konumGercegi(o, k.id, d));
        }
      }
    }
  });
});

describe('bilgiDagit — algı modeli', () => {
  it('"gördü" konum bilgisi her zaman doğru ve aynı odada olma şartına bağlı', () => {
    for (const o of ornekler) {
      for (const b of o.dagilim.bilgiler) {
        if (b.konu !== 'konum' || b.kaynak !== 'gordu') continue;
        expect(b.dogru).toBe(true);
        expect(b.icerik).toBe(konumGercegi(o, b.hedefKisi!, b.hedefDilim!));
        // Gözlemci de aynı odadaydı
        expect(konumGercegi(o, b.kisi, b.hedefDilim!)).toBe(b.icerik);
      }
    }
  });

  it('dikkat dağıtan eylem yapan gözlemci aynı odadakini daha az görür (dikkatsizlik körlüğü)', () => {
    let dagitanFirsat = 0, dagitanGordu = 0, normalFirsat = 0, normalGordu = 0;
    for (const o of ornekler) {
      const canlilar = o.vaka.kisiler.filter((k) => k.hayatta);
      for (const gozlemci of canlilar) {
        for (let d = 0; d < DILIM_SAYISI; d++) {
          const gz = o.vaka.zamanCizelgesi.find((z) => z.kisi === gozlemci.id && z.dilim === d)!;
          const dagitan = DIKKAT_DAGITAN_EYLEMLER.includes(gz.eylem);
          for (const hedef of o.vaka.kisiler) {
            if (hedef.id === gozlemci.id) continue;
            if (konumGercegi(o, hedef.id, d) !== gz.oda) continue;
            const gordu = o.dagilim.bilgiler.some((b) => b.kisi === gozlemci.id && b.konu === 'konum' && b.kaynak === 'gordu' && b.hedefKisi === hedef.id && b.hedefDilim === d);
            if (dagitan) { dagitanFirsat++; if (gordu) dagitanGordu++; }
            else { normalFirsat++; if (gordu) normalGordu++; }
          }
        }
      }
    }
    expect(dagitanFirsat).toBeGreaterThan(50);
    expect(normalFirsat).toBeGreaterThan(50);
    const dagitanOran = dagitanGordu / dagitanFirsat;
    const normalOran = normalGordu / normalFirsat;
    expect(normalOran).toBeGreaterThan(0.8);
    expect(dagitanOran).toBeLessThan(normalOran - 0.25);
  });

  it('dedikodu bilgisi bazen yanlıştır ve yanlış olanın içeriği gerçekten farklıdır', () => {
    let dedikodu = 0, yanlis = 0;
    for (const o of ornekler) {
      for (const b of o.dagilim.bilgiler) {
        if (b.kaynak !== 'dedikodu' || b.konu !== 'konum') continue;
        dedikodu++;
        const gercek = konumGercegi(o, b.hedefKisi!, b.hedefDilim!);
        if (b.dogru) expect(b.icerik).toBe(gercek);
        else { yanlis++; expect(b.icerik).not.toBe(gercek); }
      }
    }
    expect(dedikodu).toBeGreaterThan(30);
    expect(yanlis / dedikodu).toBeGreaterThan(0.1);
    expect(yanlis / dedikodu).toBeLessThan(0.5);
  });

  it('fail kimliğini masumlar ancak görgü tanığı olarak bilir (dedikodu/medya yoluyla değil)', () => {
    for (const o of ornekler) {
      for (const b of o.dagilim.bilgiler) {
        if (b.konu !== 'fail-kimligi') continue;
        if (b.kisi === o.vaka.olay.fail) continue;
        expect(b.kaynak, `${o.seed}: ${b.kisi} fail kimliğini ${b.kaynak} ile biliyor`).toBe('gordu');
        // Olay anında olay odasındaydı
        expect(konumGercegi(o, b.kisi, o.vaka.olay.dilim)).toBe(o.vaka.olay.oda);
      }
    }
  });
});

describe('bilgiDagit — medya sızıntısı ve CIT geçerliliği', () => {
  it('yöntem medyaya sızdıysa herkes bilir ve CIT geçersiz; sızmadıysa geçerli', () => {
    let sizan = 0;
    for (const o of ornekler) {
      if (!o.vaka.olay.fail) continue;
      const sizdi = o.dagilim.medyayaSizanKonular.includes('olay-yontemi');
      if (sizdi) {
        sizan++;
        for (const k of o.vaka.kisiler) if (k.hayatta) expect(kimBiliyor(o.dagilim, 'olay-yontemi')).toContain(k.id);
        expect(citGecerliMi(o.vaka, o.dagilim, 'olay-yontemi')).toBe(false);
      } else {
        expect(citGecerliMi(o.vaka, o.dagilim, 'olay-yontemi')).toBe(true);
      }
    }
    expect(sizan).toBeGreaterThan(5);
    expect(sizan).toBeLessThan(ornekler.length * 0.6);
  });

  it('olay yeri kamuya açık olduğu için CIT her zaman geçersiz', () => {
    for (const o of ornekler) if (o.vaka.olay.fail) expect(citGecerliMi(o.vaka, o.dagilim, 'olay-yeri')).toBe(false);
  });

  it('kimBiliyor tekrarsız kişi listesi döner', () => {
    for (const o of ornekler.slice(0, 10)) {
      const liste = kimBiliyor(o.dagilim, 'olay-zamani');
      expect(new Set(liste).size).toBe(liste.length);
    }
  });

  it('Bilgi tipi dışa aktarılıyor (tip düzeyi)', () => {
    const b: Bilgi = ornekler[0]!.dagilim.bilgiler[0]!;
    expect(b).toBeDefined();
  });
});
