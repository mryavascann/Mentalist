// Depo ve takım hikâyesi eklemeleri:
//   - Konuşma kaydı, konum cevabında oda kimliğini taşır (oda görseli için); "bilmiyorum"da taşımaz.
//   - Aynı soru ikinci kez sorulunca kayıt "(tekrar)" der; sayaç kayıtla taşınır.
//   - Ayna 3. karşılaşmadan itibaren takım sahnesi Ayna'yı konuşur; öncesinde konuşmaz.
import { describe, it, expect } from 'vitest';
import { OyunDeposu } from '@arayuz/oyun/depo';
import { takimSahnesi } from '@arayuz/oyun/takim_hikaye';

describe('OyunDeposu — oda kimliği ve tekrar', () => {
  it('konum cevabı kaydı odaId taşır; ikinci soruş "(tekrar)" işaretli; sayaç dışa/içe aktarımda korunur', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    depo.yeniVaka('devam-1');
    const vaka = depo.durum.sorgu!.durum.vaka;
    const kisi = depo.gorusulebilirler()[0]!;
    depo.kisiSec(kisi.id);
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: 0 });
    depo.sor({ tur: 'konum', hedef: kisi.id, dilim: 0 });
    const k = depo.durum.konusmalar.get(kisi.id)!;
    const cevap = depo.durum.sorgu!.durum.defter.get(`${kisi.id}|konum:${kisi.id}:0`)!;
    if (cevap.icerik) { expect(k[0]!.odaId).toBe(cevap.icerik); expect(vaka.mekan.odalar.some((o) => o.id === k[0]!.odaId)).toBe(true); }
    else expect(k[0]!.odaId).toBeUndefined();
    expect(k[0]!.soru).not.toMatch(/tekrar/);
    expect(k[1]!.soru).toMatch(/\(tekrar\)/);
    const kopya = new OyunDeposu();
    expect(kopya.iceAktar(depo.disaAktar())).toBe(true);
    expect(kopya.durum.sorgu!.soruSayaci.get(`${kisi.id}|konum:${kisi.id}:0`)).toBe(2);
    kopya.kisiSec(kisi.id);
    kopya.sor({ tur: 'konum', hedef: kisi.id, dilim: 0 });
    expect(kopya.durum.konusmalar.get(kisi.id)!.at(-1)!.soru).toMatch(/tekrar/);
  });
});

describe('OyunDeposu — betimleme özeti ve büyük harf', () => {
  it('serbest anlatım ve temel çizgi kayıtlarında gözlemler ipucu başına bir kez ve sınırlı; her cevap büyük harfle (ya da tırnak/rakamla) başlar', () => {
    for (const seed of ['ozet-1', 'ozet-2', 'ozet-3']) {
      const depo = new OyunDeposu();
      depo.basla('Deniz');
      depo.yeniVaka(seed);
      for (const k of depo.gorusulebilirler()) {
        depo.kisiSec(k.id);
        depo.teknik('temel-cizgi');
        depo.teknik('acik-uclu-anlatim');
        depo.sor({ tur: 'olay-bilgisi', konu: 'olay-yontemi' });
        for (const kayit of depo.durum.konusmalar.get(k.id)!) {
          const idler = kayit.gozlemler.map((g) => g.ipucuId);
          expect(new Set(idler).size, `${seed}/${k.id}/${kayit.soru}`).toBe(idler.length);
          expect(idler.length).toBeLessThanOrEqual(8);
          expect(kayit.cevap, kayit.cevap).toMatch(/^[A-ZÇĞİÖŞÜ0-9"'\[(]/);
        }
        const not = depo.durum.temelCizgiNotlari.get(k.id)!;
        expect(not.split('. ').length).toBeLessThanOrEqual(7);
      }
    }
  });
});

describe('takım sahnesi — Ayna arkı', () => {
  const g = (ayna: boolean, okundu = true) => ({ dogru: false, hataEtiketleri: ['othello-hatasi'], ...(ayna ? { ayna: { etiket: 'othello-hatasi', okundu } } : {}) });

  it('ilk iki Ayna vakasında sahne Ayna\'yı anmaz; üçüncüden itibaren son vaka Ayna ise Ayna satırı ve Kılavuz bağı gelir', () => {
    const az = takimSahnesi([g(false), g(false), g(true), g(false), g(false), g(true)], 'Deniz')!;
    expect(az.satirlar.some((s) => /Ayna/.test(s.metin))).toBe(false);
    const uc = takimSahnesi([g(false), g(false), g(true), g(false), g(false), g(true), g(false), g(false), g(true, true)], 'Deniz')!;
    expect(uc.satirlar.some((s) => /Ayna/.test(s.metin))).toBe(true);
    expect(uc.ayna).toBeDefined();
    expect(uc.ayna!.okunmaOrani).toBeCloseTo(1, 5);
    // Okunmadıysa ton farklı, yine Ayna anılır.
    const kirdi = takimSahnesi([g(false), g(false), g(true), g(false), g(false), g(true), g(false), g(false), g(true, false)], 'Deniz')!;
    expect(kirdi.satirlar.some((s) => /Ayna/.test(s.metin))).toBe(true);
    expect(kirdi.satirlar.map((s) => s.metin).join(' ')).not.toBe(uc.satirlar.map((s) => s.metin).join(' '));
    // Son vaka Ayna değilse (ark devam etse de) Ayna satırı yok.
    const ara = takimSahnesi([g(false), g(false), g(true), g(false), g(false), g(true), g(false), g(false), g(true), g(false)], 'Deniz')!;
    expect(ara.satirlar.some((s) => /Ayna/.test(s.metin))).toBe(false);
    // Deterministik ve kahraman adı geçer.
    expect(takimSahnesi([g(false), g(false), g(true), g(false), g(false), g(true), g(false), g(false), g(true, true)], 'Deniz')).toEqual(uc);
    expect(uc.satirlar.map((s) => s.metin).join(' ')).toContain('Deniz');
  });
});
