// Oynanış cilası: kanepe molası, ifade çizelgesi, karar günlüğü / kalibrasyon özeti.
import { describe, it, expect } from 'vitest';
import { OyunDeposu } from '@arayuz/oyun/depo';
import { ifadeCizelgesi, kalibrasyonOzeti } from '@arayuz/oyun/cizelge';

function sucluOyun(on = 'cila3') {
  let depo = new OyunDeposu();
  depo.basla('Deniz');
  depo.yeniVaka(`${on}-0`);
  for (let i = 1; !depo.durum.sorgu!.durum.vaka.olay.fail && i < 20; i++) { depo = new OyunDeposu(); depo.basla('Deniz'); depo.yeniVaka(`${on}-${i}`); }
  return depo;
}

describe('kanepe molası', () => {
  it('zamanı 1 saat ilerletir, takım bir not getirir (delil ya da dedikodu), notlar birikir ve kayıtla taşınır; suçlama sonrası kapalı', () => {
    const depo = sucluOyun();
    const once = depo.durum.zaman;
    expect(depo.kanepeMolasi()).toBe(true);
    expect(depo.durum.zaman).toBeCloseTo(once + 1, 5);
    expect(depo.durum.takimNotlari.length).toBe(1);
    const not = depo.durum.takimNotlari[0]!;
    expect(not.metin.length).toBeGreaterThan(10);
    expect(['delil', 'dedikodu', 'bos']).toContain(not.tur);
    for (let i = 0; i < 6; i++) depo.kanepeMolasi();
    expect(depo.durum.takimNotlari.length).toBe(7);
    const yeni = new OyunDeposu();
    expect(yeni.iceAktar(depo.disaAktar())).toBe(true);
    expect(yeni.durum.takimNotlari.length).toBe(7);
    depo.suclamaYap({ fail: null, guven: 0.5 });
    expect(depo.kanepeMolasi()).toBe(false);
  });

  it('notlar gizli bilgiyi sızdırmaz: failin adı "fail" olarak geçmez, dedikodu yanlış olabilir ama gerçek etiketi taşımaz', () => {
    for (let i = 0; i < 20; i++) {
      const depo = sucluOyun(`kanepe-${i}`);
      for (let j = 0; j < 5; j++) depo.kanepeMolasi();
      for (const n of depo.durum.takimNotlari) {
        expect(n.metin).not.toMatch(/fail|sahnelenmi|yalan|gizli etiket/i);
        expect(n.metin).not.toMatch(/undefined|\[object/);
      }
    }
  });
});

describe('ifadeCizelgesi', () => {
  it('kişi × dilim matrisi: sorulmamış hücre null, sorulmuş hücre iddia edilen oda adı ya da "bilmiyor"', () => {
    const depo = sucluOyun('cizelge');
    const q = depo.durum.sorgu!;
    const k = depo.gorusulebilirler()[0]!;
    depo.kisiSec(k.id);
    depo.sor({ tur: 'konum', hedef: k.id, dilim: 2 });
    const c = ifadeCizelgesi(q);
    expect(c.kisiler.length).toBe(depo.gorusulebilirler().length);
    expect(c.dilimler.length).toBe(q.durum.vaka.dilimler.length);
    const satir = c.hucreler.get(k.id)!;
    expect(satir[2]).not.toBeNull();
    expect(satir[0]).toBeNull();
    const oda = q.durum.vaka.mekan.odalar.map((o) => o.ad);
    expect(satir[2] === 'bilmiyor' || oda.includes(satir[2]!)).toBe(true);
  });
});

describe('kalibrasyonOzeti', () => {
  it('güven kovalarına göre beyan edilen güven ile gerçek doğruluğu karşılaştırır; boş geçmişte boş', () => {
    expect(kalibrasyonOzeti([])).toEqual([]);
    const gecmis = [
      { seed: 'a', dogru: true, puan: 100, hataEtiketleri: [], brier: 0.01 },
      { seed: 'b', dogru: false, puan: 0, hataEtiketleri: [], brier: 0.81 },
      { seed: 'c', dogru: true, puan: 100, hataEtiketleri: [], brier: 0.04 },
      { seed: 'd', dogru: false, puan: 0, hataEtiketleri: [], brier: 0.36 },
    ];
    const o = kalibrasyonOzeti(gecmis);
    expect(o.length).toBeGreaterThan(0);
    for (const k of o) {
      expect(k.beyanOrt).toBeGreaterThanOrEqual(0.5);
      expect(k.beyanOrt).toBeLessThanOrEqual(1);
      expect(k.dogrulukOrani).toBeGreaterThanOrEqual(0);
      expect(k.dogrulukOrani).toBeLessThanOrEqual(1);
      expect(k.sayi).toBeGreaterThan(0);
    }
    // Brier'dan güven geri türetilir: dogru=true, brier=.01 → güven .9; dogru=false, brier=.81 → güven .9
    const yuksek = o.find((k) => k.kova === '0.85–1.00')!;
    expect(yuksek.sayi).toBe(2);
    expect(yuksek.dogrulukOrani).toBe(0.5);
  });
});
