// NPC konuşma stratejisi ve yalan defteri testleri.
// Her soru için kişi doğru / yalan / gizleme / kaçamak / koruma kararı verir; söylediği yalanları
// defterinde tutar ve tekrar sorulduğunda tutarlı kalır (Vrij 2010: planlı yalan tutarlıdır).
// Her cevabın gizli etiketi (ifadeTuru) TASARIM §6 tablosundan gelir ve vaka sonu analizini besler.
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { bilgiDagit } from '@motor/bilgi';
import { sirlarUret, odaYalaniGerektirir } from '@motor/sirlar';
import { vakaDurumuKur, cevapla, soruAnahtari } from '@motor/strateji';
import type { Soru } from '@motor/strateji';
import { ICERIK } from '@icerik/index';

const IFADE_TURU_IDLERI = new Set(ICERIK.ifadeTurleri.map((t) => t.id));

const ornekler = Array.from({ length: 100 }, (_, i) => vakaDurumuKur(vakaUret(`strateji-${i}`)));

const konum = (o: (typeof ornekler)[number], kisi: string, dilim: number) =>
  o.vaka.zamanCizelgesi.find((z) => z.kisi === kisi && z.dilim === dilim)!.oda;

const koruyorMu = (o: (typeof ornekler)[number], koruyan: string, korunan: string) =>
  o.sirKatmani.korumalar.some((c) => c.koruyan === koruyan && c.korunan === korunan);

describe('vakaDurumuKur / soruAnahtari', () => {
  it('durum, vaka + bilgi + sırlar + boş defter içerir', () => {
    const o = ornekler[0]!;
    expect(o.vaka).toBeDefined();
    expect(o.dagilim).toEqual(bilgiDagit(o.vaka));
    expect(o.sirKatmani).toEqual(sirlarUret(o.vaka));
    expect(o.defter.size).toBe(0);
  });

  it('soru anahtarı aynı soru için aynı, farklı soru için farklı', () => {
    const a: Soru = { tur: 'konum', hedef: 'k1', dilim: 3 };
    expect(soruAnahtari(a)).toBe(soruAnahtari({ tur: 'konum', hedef: 'k1', dilim: 3 }));
    expect(soruAnahtari(a)).not.toBe(soruAnahtari({ tur: 'konum', hedef: 'k1', dilim: 4 }));
    expect(soruAnahtari(a)).not.toBe(soruAnahtari({ tur: 'olay-bilgisi', konu: 'olay-yontemi' }));
  });
});

describe('cevapla — genel kurallar', () => {
  it('her cevabın ifade türü içerik kütüğünde tanımlı; içerik oda ise mekânda var', () => {
    for (const o of ornekler.slice(0, 40)) {
      const odalar = new Set(o.vaka.mekan.odalar.map((x) => x.id));
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta) continue;
        for (const hedef of o.vaka.kisiler) {
          for (let d = 0; d < o.vaka.dilimler.length; d += 3) {
            const c = cevapla(o, k.id, { tur: 'konum', hedef: hedef.id, dilim: d });
            expect(IFADE_TURU_IDLERI.has(c.ifadeTuru), `${c.ifadeTuru}`).toBe(true);
            if (c.icerik !== null) expect(odalar.has(c.icerik), `${o.vaka.seed}: ${c.icerik}`).toBe(true);
          }
        }
      }
    }
  });

  it('aynı soru tekrar sorulunca defterden aynı cevap gelir (tutarlılık)', () => {
    for (const o of ornekler.slice(0, 30)) {
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta) continue;
        const soru: Soru = { tur: 'konum', hedef: k.id, dilim: o.vaka.olay.dilim };
        const ilk = cevapla(o, k.id, soru);
        const ikinci = cevapla(o, k.id, soru);
        expect(ikinci).toEqual(ilk);
      }
    }
  });

  it('cevaplar soru sırasından bağımsız (deterministik)', () => {
    const a = vakaDurumuKur(vakaUret('sira'));
    const b = vakaDurumuKur(vakaUret('sira'));
    const k = a.vaka.kisiler.find((x) => x.hayatta)!.id;
    const s1: Soru = { tur: 'konum', hedef: k, dilim: 2 };
    const s2: Soru = { tur: 'olay-bilgisi', konu: 'olay-yontemi' };
    const a1 = cevapla(a, k, s1); const a2 = cevapla(a, k, s2);
    const b2 = cevapla(b, k, s2); const b1 = cevapla(b, k, s1);
    expect(a1).toEqual(b1);
    expect(a2).toEqual(b2);
  });

  it('"dogru" alanı içerik-gerçek uyumunu yansıtır (oda cevaplarında)', () => {
    for (const o of ornekler.slice(0, 40)) {
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta) continue;
        for (let d = 0; d < o.vaka.dilimler.length; d += 2) {
          const c = cevapla(o, k.id, { tur: 'konum', hedef: k.id, dilim: d });
          if (c.icerik === null) continue;
          expect(c.dogru).toBe(c.icerik === konum(o, k.id, d));
        }
      }
    }
  });
});

describe('cevapla — kendi konumu', () => {
  it('fail olay anındaki konumunu ya gömülü yalanla saklar ya kaçamak verir', () => {
    let gomulu = 0, kacamak = 0;
    for (const o of ornekler) {
      const f = o.vaka.olay.fail;
      if (!f) continue;
      const c = cevapla(o, f, { tur: 'konum', hedef: f, dilim: o.vaka.olay.dilim });
      expect(['gomulu-yalan', 'kacamak']).toContain(c.ifadeTuru);
      if (c.ifadeTuru === 'gomulu-yalan') {
        gomulu++;
        expect(c.icerik).not.toBe(o.vaka.olay.oda);
        expect(c.dogru).toBe(false);
      } else {
        kacamak++;
        expect(c.icerik).toBe(o.vaka.olay.oda);
        expect(c.dogru).toBe(true);
      }
    }
    expect(gomulu).toBeGreaterThan(10);
    expect(kacamak).toBeGreaterThan(3);
  });

  it('gömülü yalan gerçekten "gömülü": iddia edilen oda, failin o akşam gerçekten bulunduğu bir oda', () => {
    for (const o of ornekler) {
      const f = o.vaka.olay.fail;
      if (!f) continue;
      const c = cevapla(o, f, { tur: 'konum', hedef: f, dilim: o.vaka.olay.dilim });
      if (c.ifadeTuru !== 'gomulu-yalan') continue;
      const bulundugu = new Set(o.vaka.zamanCizelgesi.filter((z) => z.kisi === f).map((z) => z.oda));
      expect(bulundugu.has(c.icerik!)).toBe(true);
    }
  });

  it('sırsız, kimseyi korumayan masum kendi konumunu doğru söyler', () => {
    let sayi = 0;
    for (const o of ornekler) {
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta || k.id === o.vaka.olay.fail || k.id === o.vaka.olay.kurban) continue;
        if (o.sirKatmani.sirlar.some((s) => s.kisi === k.id)) continue;
        for (let d = 0; d < o.vaka.dilimler.length; d++) {
          const c = cevapla(o, k.id, { tur: 'konum', hedef: k.id, dilim: d });
          expect(c.ifadeTuru).toBe('dogru');
          expect(c.icerik).toBe(konum(o, k.id, d));
          sayi++;
        }
      }
    }
    expect(sayi).toBeGreaterThan(100);
  });

  it('oda yalanı gerektiren sırrı olan masum, sır dilimlerinde "alakasız sır" yalanı söyler; diğer sırlar gizleme', () => {
    let yalan = 0, gizleme = 0;
    for (const o of ornekler) {
      for (const s of o.sirKatmani.sirlar) {
        if (s.kisi === o.vaka.olay.fail) continue;
        for (const d of s.dilimler) {
          const c = cevapla(o, s.kisi, { tur: 'konum', hedef: s.kisi, dilim: d });
          if (odaYalaniGerektirir(s.tur)) {
            yalan++;
            expect(c.ifadeTuru).toBe('alakasiz-sir');
            expect(c.icerik).not.toBe(konum(o, s.kisi, d));
            expect(c.dogru).toBe(false);
          } else {
            gizleme++;
            expect(c.ifadeTuru).toBe('gizleme');
            expect(c.icerik).toBe(konum(o, s.kisi, d));
            expect(c.dogru).toBe(true);
          }
        }
      }
    }
    expect(yalan).toBeGreaterThan(20);
    expect(gizleme).toBeGreaterThan(20);
  });
});

describe('cevapla — başkasının konumu', () => {
  it('koruyan, korunanın olay anındaki konumu sorulunca "yanımdaydı" der (koruma yalanı) — birlikte değillerse', () => {
    let sayi = 0;
    for (const o of ornekler) {
      for (const c of o.sirKatmani.korumalar) {
        const d = o.vaka.olay.dilim;
        if (konum(o, c.koruyan, d) === konum(o, c.korunan, d)) continue;
        const cevap = cevapla(o, c.koruyan, { tur: 'konum', hedef: c.korunan, dilim: d });
        expect(cevap.ifadeTuru).toBe('koruma-yalani');
        expect(cevap.icerik).toBe(konum(o, c.koruyan, d));
        expect(cevap.dogru).toBe(false);
        sayi++;
      }
    }
    expect(sayi).toBeGreaterThan(20);
  });

  it('bilgisi olmayan "bilmiyorum" der (icerik null) ve bu dürüsttür; aynı odada olup fark etmeyen "dikkat boşluğu"', () => {
    let bilmiyor = 0, bosluk = 0;
    for (const o of ornekler) {
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta) continue;
        for (const hedef of o.vaka.kisiler) {
          if (hedef.id === k.id || koruyorMu(o, k.id, hedef.id)) continue;
          for (let d = 0; d < o.vaka.dilimler.length; d += 2) {
            const bilgi = o.dagilim.bilgiler.find((b) => b.kisi === k.id && b.konu === 'konum' && b.hedefKisi === hedef.id && b.hedefDilim === d);
            if (bilgi) continue;
            const c = cevapla(o, k.id, { tur: 'konum', hedef: hedef.id, dilim: d });
            expect(c.icerik).toBeNull();
            expect(c.dogru).toBe(true);
            if (konum(o, k.id, d) === konum(o, hedef.id, d)) { bosluk++; expect(c.ifadeTuru).toBe('dikkat-boslugu'); }
            else { bilmiyor++; expect(c.ifadeTuru).toBe('dogru'); }
          }
        }
      }
    }
    expect(bilmiyor).toBeGreaterThan(100);
    expect(bosluk).toBeGreaterThan(5);
  });

  it('bozuk dedikoduya dayanan cevap "bellek uyumu" etiketi alır ve yanlıştır', () => {
    let sayi = 0;
    for (const o of ornekler) {
      for (const b of o.dagilim.bilgiler) {
        if (b.konu !== 'konum' || b.kaynak !== 'dedikodu' || b.dogru) continue;
        if (koruyorMu(o, b.kisi, b.hedefKisi!)) continue;
        const c = cevapla(o, b.kisi, { tur: 'konum', hedef: b.hedefKisi!, dilim: b.hedefDilim! });
        expect(c.ifadeTuru).toBe('bellek-uyumu');
        expect(c.dogru).toBe(false);
        expect(c.icerik).toBe(b.icerik);
        sayi++;
      }
    }
    expect(sayi).toBeGreaterThan(10);
  });

  it('gördüğünü doğru aktarır', () => {
    let sayi = 0;
    for (const o of ornekler.slice(0, 40)) {
      for (const b of o.dagilim.bilgiler) {
        if (b.konu !== 'konum' || b.kaynak !== 'gordu') continue;
        if (koruyorMu(o, b.kisi, b.hedefKisi!)) continue;
        const c = cevapla(o, b.kisi, { tur: 'konum', hedef: b.hedefKisi!, dilim: b.hedefDilim! });
        expect(c.ifadeTuru).toBe('dogru');
        expect(c.icerik).toBe(b.icerik);
        sayi++;
      }
    }
    expect(sayi).toBeGreaterThan(50);
  });
});

describe('cevapla — olay bilgisi', () => {
  it('fail kimliğini asla itiraf etmez (gizleme, içerik yok, dürüst değil)', () => {
    for (const o of ornekler) {
      const f = o.vaka.olay.fail;
      if (!f) continue;
      const c = cevapla(o, f, { tur: 'olay-bilgisi', konu: 'fail-kimligi' });
      expect(c.ifadeTuru).toBe('gizleme');
      expect(c.icerik).toBeNull();
      expect(c.dogru).toBe(false);
    }
  });

  it('fail yöntemi medyaya sızmışsa söyler, sızmamışsa bilmiyormuş gibi yapar', () => {
    let sizan = 0, gizli = 0;
    for (const o of ornekler) {
      const f = o.vaka.olay.fail;
      if (!f) continue;
      const c = cevapla(o, f, { tur: 'olay-bilgisi', konu: 'olay-yontemi' });
      if (o.dagilim.medyayaSizanKonular.includes('olay-yontemi')) {
        sizan++;
        expect(c.ifadeTuru).toBe('dogru');
        expect(c.icerik).toBe(o.vaka.olay.yontem);
      } else {
        gizli++;
        expect(c.ifadeTuru).toBe('gizleme');
        expect(c.icerik).toBeNull();
        expect(c.dogru).toBe(false);
      }
    }
    expect(sizan).toBeGreaterThan(5);
    expect(gizli).toBeGreaterThan(5);
  });

  it('faili görmüş ve onu korumayan masum faili doğru söyler; koruyan masum saklar', () => {
    let soyledi = 0, sakladi = 0;
    for (const o of ornekler) {
      const f = o.vaka.olay.fail;
      if (!f) continue;
      for (const b of o.dagilim.bilgiler) {
        if (b.konu !== 'fail-kimligi' || b.kisi === f) continue;
        const c = cevapla(o, b.kisi, { tur: 'olay-bilgisi', konu: 'fail-kimligi' });
        if (koruyorMu(o, b.kisi, f)) { sakladi++; expect(c.ifadeTuru).toBe('koruma-yalani'); expect(c.icerik).toBeNull(); }
        else { soyledi++; expect(c.ifadeTuru).toBe('dogru'); expect(c.icerik).toBe(f); }
      }
    }
    expect(soyledi + sakladi).toBeGreaterThan(5);
  });

  it('bilmeyen masum "bilmiyorum" der ve bu dürüsttür', () => {
    for (const o of ornekler.slice(0, 40)) {
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta || k.id === o.vaka.olay.fail) continue;
        if (o.dagilim.bilgiler.some((b) => b.kisi === k.id && b.konu === 'olay-yontemi')) continue;
        const c = cevapla(o, k.id, { tur: 'olay-bilgisi', konu: 'olay-yontemi' });
        expect(c.icerik).toBeNull();
        expect(c.dogru).toBe(true);
        expect(c.ifadeTuru).toBe('dogru');
      }
    }
  });
});
