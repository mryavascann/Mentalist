// Sırlar ve koruma ilişkileri testleri.
// Masum ama bir şey saklayan kişiler (alakasız sır) Othello hatasının ana kaynağıdır; koruma
// ilişkileri (borç, aile, ortak sır) koruma yalanlarını doğurur (Cialdini karşılıklılık, Navarro).
import { describe, it, expect } from 'vitest';
import { vakaUret, DILIM_SAYISI } from '@motor/gerceklik';
import { sirlarUret, SIR_TURLERI, odaYalaniGerektirir } from '@motor/sirlar';

const ornekler = Array.from({ length: 120 }, (_, i) => {
  const vaka = vakaUret(`sir-${i}`);
  return { seed: `sir-${i}`, vaka, katman: sirlarUret(vaka) };
});

const konum = (o: (typeof ornekler)[number], kisi: string, dilim: number) =>
  o.vaka.zamanCizelgesi.find((z) => z.kisi === kisi && z.dilim === dilim)!.oda;

describe('sirlarUret — yapı', () => {
  it('deterministik', () => {
    const v = vakaUret('sir-det');
    expect(sirlarUret(v)).toEqual(sirlarUret(v));
  });

  it('sırlar geçerli, hayatta ve kurban olmayan kişilere ait; tür listeden; dilimler 1–3 adet, sıralı ve aralıkta', () => {
    for (const o of ornekler) {
      const kisiler = new Map(o.vaka.kisiler.map((k) => [k.id, k]));
      for (const s of o.katman.sirlar) {
        const k = kisiler.get(s.kisi)!;
        expect(k).toBeDefined();
        expect(k.hayatta).toBe(true);
        expect(s.kisi).not.toBe(o.vaka.olay.kurban);
        expect(SIR_TURLERI).toContain(s.tur);
        expect(s.aciklama.length).toBeGreaterThan(0);
        expect(s.dilimler.length).toBeGreaterThanOrEqual(1);
        expect(s.dilimler.length).toBeLessThanOrEqual(3);
        for (let i = 0; i < s.dilimler.length; i++) {
          expect(s.dilimler[i]).toBeGreaterThanOrEqual(0);
          expect(s.dilimler[i]).toBeLessThan(DILIM_SAYISI);
          if (i > 0) expect(s.dilimler[i]).toBe(s.dilimler[i - 1]! + 1);
        }
      }
    }
  });

  it('her kişinin en fazla bir sırrı var', () => {
    for (const o of ornekler) {
      const sahipler = o.katman.sirlar.map((s) => s.kisi);
      expect(new Set(sahipler).size).toBe(sahipler.length);
    }
  });

  it('gizli ilişki sırrının ortağı geçerli, farklı ve o dilimlerde aynı odada (gerçekle tutarlı)', () => {
    let sayi = 0;
    for (const o of ornekler) {
      for (const s of o.katman.sirlar) {
        if (s.tur !== 'gizli-iliski') continue;
        sayi++;
        expect(s.ortak).toBeDefined();
        expect(s.ortak).not.toBe(s.kisi);
        expect(s.ortak).not.toBe(o.vaka.olay.kurban);
        for (const d of s.dilimler) expect(konum(o, s.kisi, d)).toBe(konum(o, s.ortak!, d));
      }
    }
    expect(sayi).toBeGreaterThan(10);
  });

  it('odaYalaniGerektirir: ilişki/ziyaret sırları oda yalanı, diğerleri gizleme', () => {
    expect(odaYalaniGerektirir('gizli-iliski')).toBe(true);
    expect(odaYalaniGerektirir('gizli-ziyaret')).toBe(true);
    expect(odaYalaniGerektirir('bagimlilik')).toBe(false);
    expect(odaYalaniGerektirir('sabika')).toBe(false);
  });
});

describe('sirlarUret — dağılım', () => {
  it('masumların yaklaşık %30–60\'ının sırrı var; fail de sır taşıyabilir', () => {
    let masum = 0, sirliMasum = 0, sirliFail = 0, failSayi = 0;
    for (const o of ornekler) {
      for (const k of o.vaka.kisiler) {
        if (!k.hayatta || k.id === o.vaka.olay.kurban) continue;
        const sirli = o.katman.sirlar.some((s) => s.kisi === k.id);
        if (k.id === o.vaka.olay.fail) { failSayi++; if (sirli) sirliFail++; }
        else { masum++; if (sirli) sirliMasum++; }
      }
    }
    const oran = sirliMasum / masum;
    expect(oran).toBeGreaterThan(0.3);
    expect(oran).toBeLessThan(0.6);
    expect(sirliFail / failSayi).toBeGreaterThan(0.1);
  });

  it('vakaların en az dörtte birinde "gergin masum" var: sırrı olay anını kapsayan masum', () => {
    let sayi = 0;
    for (const o of ornekler) {
      const var_ = o.katman.sirlar.some((s) => s.kisi !== o.vaka.olay.fail && s.dilimler.includes(o.vaka.olay.dilim));
      if (var_) sayi++;
    }
    expect(sayi / ornekler.length).toBeGreaterThan(0.25);
  });
});

describe('sirlarUret — korumalar', () => {
  it('korumalar geçerli: koruyan ≠ korunan, ikisi de hayatta, kurban değil, tekrarsız, neden tanımlı', () => {
    for (const o of ornekler) {
      const kisiler = new Map(o.vaka.kisiler.map((k) => [k.id, k]));
      const gorulen = new Set<string>();
      for (const c of o.katman.korumalar) {
        expect(c.koruyan).not.toBe(c.korunan);
        expect(kisiler.get(c.koruyan)!.hayatta).toBe(true);
        expect(kisiler.get(c.korunan)!.hayatta).toBe(true);
        expect(c.korunan).not.toBe(o.vaka.olay.kurban);
        expect(c.koruyan).not.toBe(o.vaka.olay.kurban);
        expect(['borc', 'aile', 'es', 'sevgili', 'ortak-sir', 'korku']).toContain(c.neden);
        const anahtar = `${c.koruyan}>${c.korunan}`;
        expect(gorulen.has(anahtar)).toBe(false);
        gorulen.add(anahtar);
      }
    }
  });

  it('faile ağır borcu olanların çoğu onu korur ama hepsi değil', () => {
    let firsat = 0, korudu = 0;
    for (const o of ornekler) {
      const f = o.vaka.olay.fail;
      if (!f) continue;
      for (const b of o.vaka.borclar) {
        if (b.alacakli !== f || b.agirlik <= 0.5) continue;
        const borclu = o.vaka.kisiler.find((k) => k.id === b.borclu)!;
        if (!borclu.hayatta) continue;
        firsat++;
        if (o.katman.korumalar.some((c) => c.koruyan === b.borclu && c.korunan === f && c.neden === 'borc')) korudu++;
      }
    }
    expect(firsat).toBeGreaterThan(10);
    expect(korudu / firsat).toBeGreaterThan(0.6);
    expect(korudu / firsat).toBeLessThan(1);
  });

  it('gizli ilişki ortakları birbirini korur (ortak-sir)', () => {
    for (const o of ornekler) {
      for (const s of o.katman.sirlar) {
        if (s.tur !== 'gizli-iliski') continue;
        expect(o.katman.korumalar.some((c) => c.koruyan === s.ortak && c.korunan === s.kisi && c.neden === 'ortak-sir')).toBe(true);
        expect(o.katman.korumalar.some((c) => c.koruyan === s.kisi && c.korunan === s.ortak && c.neden === 'ortak-sir')).toBe(true);
      }
    }
  });

  it('masumu koruyan masumlar da var (koruma ≠ suç ortaklığı)', () => {
    let masumKoruma = 0;
    for (const o of ornekler) {
      for (const c of o.katman.korumalar) if (c.korunan !== o.vaka.olay.fail) masumKoruma++;
    }
    expect(masumKoruma).toBeGreaterThan(20);
  });
});
