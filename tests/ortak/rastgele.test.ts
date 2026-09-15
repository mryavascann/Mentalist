// Seedli rastgelelik testleri.
// Oyunun temel güvencesi: aynı seed → aynı vaka. Bu dosya o güvenceyi ve yardımcı
// dağılımların (tamsayı, seçim, karıştırma, ağırlıklı seçim, normal) doğruluğunu sınar.
import { describe, it, expect } from 'vitest';
import { Rastgele, seedHash } from '@ortak/rastgele';

describe('seedHash', () => {
  it('aynı metin aynı sayıyı verir, farklı metin farklı', () => {
    expect(seedHash('vaka-1')).toBe(seedHash('vaka-1'));
    expect(seedHash('vaka-1')).not.toBe(seedHash('vaka-2'));
  });

  it('32 bitlik işaretsiz tamsayı üretir', () => {
    const h = seedHash('herhangi bir şey');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});

describe('Rastgele — tekrar üretilebilirlik', () => {
  it('aynı seed aynı diziyi üretir (sayı ve metin seed)', () => {
    const a = new Rastgele(42);
    const b = new Rastgele(42);
    const diziA = Array.from({ length: 50 }, () => a.sayi());
    const diziB = Array.from({ length: 50 }, () => b.sayi());
    expect(diziA).toEqual(diziB);

    const c = new Rastgele('malikane');
    const d = new Rastgele('malikane');
    expect(c.sayi()).toBe(d.sayi());
  });

  it('farklı seed farklı dizi üretir', () => {
    const a = new Rastgele(1);
    const b = new Rastgele(2);
    const diziA = Array.from({ length: 10 }, () => a.sayi());
    const diziB = Array.from({ length: 10 }, () => b.sayi());
    expect(diziA).not.toEqual(diziB);
  });

  it('sayi() [0, 1) aralığında kalır', () => {
    const r = new Rastgele(7);
    for (let i = 0; i < 10_000; i++) {
      const x = r.sayi();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('Rastgele — yardımcılar', () => {
  it('tamsayi(min, max) sınırlar dahil ve tüm değerleri kapsar', () => {
    const r = new Rastgele('tamsayi');
    const gorulen = new Set<number>();
    for (let i = 0; i < 5_000; i++) {
      const x = r.tamsayi(3, 8);
      expect(x).toBeGreaterThanOrEqual(3);
      expect(x).toBeLessThanOrEqual(8);
      gorulen.add(x);
    }
    expect([...gorulen].sort()).toEqual([3, 4, 5, 6, 7, 8]);
  });

  it('tamsayi(min, max) min > max ise hata fırlatır', () => {
    const r = new Rastgele(1);
    expect(() => r.tamsayi(5, 2)).toThrow();
  });

  it('sec() diziden eleman seçer, boş dizide hata fırlatır', () => {
    const r = new Rastgele('sec');
    const dizi = ['a', 'b', 'c'];
    for (let i = 0; i < 100; i++) expect(dizi).toContain(r.sec(dizi));
    expect(() => r.sec([])).toThrow();
  });

  it('karistir() permütasyon döndürür ve kaynağı değiştirmez', () => {
    const r = new Rastgele('karistir');
    const kaynak = [1, 2, 3, 4, 5, 6, 7, 8];
    const kopya = [...kaynak];
    const sonuc = r.karistir(kaynak);
    expect(kaynak).toEqual(kopya); // dokunulmadı
    expect([...sonuc].sort((x, y) => x - y)).toEqual(kaynak);
    // 8 elemanlı dizinin hiç değişmeme olasılığı 1/40320; birkaç denemede en az biri değişmeli
    const degisti = Array.from({ length: 5 }, () => r.karistir(kaynak)).some(
      (d) => d.some((v, i) => v !== kaynak[i]),
    );
    expect(degisti).toBe(true);
  });

  it('karistir() dengeli: her eleman her konuma yaklaşık eşit sıklıkta düşer', () => {
    // Fisher-Yates doğru uygulanmışsa 4 elemanlı dizide her (eleman, konum) çifti ~%25.
    const r = new Rastgele('denge');
    const N = 20_000;
    const sayac = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
    for (let i = 0; i < N; i++) {
      const s = r.karistir([0, 1, 2, 3]);
      s.forEach((eleman, konum) => sayac[eleman]![konum]!++);
    }
    for (const satir of sayac) for (const c of satir) expect(c / N).toBeCloseTo(0.25, 1);
  });

  it('agirlikliSec() ağırlıklara orantılı seçer', () => {
    const r = new Rastgele('agirlik');
    const sayac = { a: 0, b: 0, c: 0 };
    const N = 30_000;
    for (let i = 0; i < N; i++) {
      const s = r.agirlikliSec([
        { deger: 'a' as const, agirlik: 1 },
        { deger: 'b' as const, agirlik: 2 },
        { deger: 'c' as const, agirlik: 7 },
      ]);
      sayac[s]++;
    }
    expect(sayac.a / N).toBeCloseTo(0.1, 1);
    expect(sayac.b / N).toBeCloseTo(0.2, 1);
    expect(sayac.c / N).toBeCloseTo(0.7, 1);
  });

  it('agirlikliSec() sıfır ağırlıklı elemanı asla seçmez; toplam sıfırsa hata', () => {
    const r = new Rastgele('sifir');
    for (let i = 0; i < 500; i++) {
      expect(
        r.agirlikliSec([
          { deger: 'x', agirlik: 0 },
          { deger: 'y', agirlik: 3 },
        ]),
      ).toBe('y');
    }
    expect(() => r.agirlikliSec([{ deger: 'x', agirlik: 0 }])).toThrow();
  });

  it('sans(p) yaklaşık p olasılıkla true döner', () => {
    const r = new Rastgele('sans');
    let evet = 0;
    const N = 20_000;
    for (let i = 0; i < N; i++) if (r.sans(0.3)) evet++;
    expect(evet / N).toBeCloseTo(0.3, 1);
    expect(r.sans(0)).toBe(false);
    expect(r.sans(1)).toBe(true);
  });

  it('normal(ort, sapma) ortalama ve sapmayı yaklaşık tutturur', () => {
    const r = new Rastgele('normal');
    const N = 20_000;
    const ornek = Array.from({ length: N }, () => r.normal(10, 2));
    const ort = ornek.reduce((a, b) => a + b, 0) / N;
    const varyans = ornek.reduce((a, b) => a + (b - ort) ** 2, 0) / N;
    expect(ort).toBeCloseTo(10, 0);
    expect(Math.sqrt(varyans)).toBeCloseTo(2, 0);
  });
});

describe('Rastgele — alt akışlar', () => {
  it('altUret(etiket) ebeveynin tüketiminden bağımsız, etikete göre belirlenir', () => {
    // Vaka üreticisinde kişi/olay/delil katmanları ayrı akışlar kullanır; birinin
    // kaç sayı çektiği diğerini etkilememeli (aksi halde küçük bir değişiklik tüm vakayı kaydırır).
    const a = new Rastgele('vaka');
    const b = new Rastgele('vaka');
    a.sayi(); a.sayi(); a.sayi(); // a ebeveynden 3 sayı tüketti, b hiç
    const altA = a.altUret('kisiler');
    const altB = b.altUret('kisiler');
    expect(altA.sayi()).toBe(altB.sayi());
  });

  it('farklı etiketler farklı akış üretir', () => {
    const r = new Rastgele('vaka');
    expect(r.altUret('kisiler').sayi()).not.toBe(r.altUret('deliller').sayi());
  });
});
