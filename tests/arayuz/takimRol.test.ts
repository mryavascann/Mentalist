// Takım sahnesi rol tekilliği: aynı üye art arda iki satır konuşmaz (lider ×2 gibi).
//   Tepki rolü etikete bağlıdır; arka plan anlatıcısı vaka sayısına göre döner; ikisi çakışabilir.
//   Karşılık satırı yüzer: aynı rolün art arda geldiği yere girer; anlatıcı ve kapatan komşulardan farklı seçilir.
//   Sahne yine deterministiktir ve dört üyenin arkı ilerlemeye devam eder.
import { describe, it, expect } from 'vitest';
import { ICERIK } from '@icerik/index';
import { takimSahnesi, type SahneGecmisi } from '@arayuz/oyun/takim_hikaye';

describe('takım sahnesi — rol tekilliği', () => {
  it('hiçbir sahnede aynı rol art arda konuşmaz (n=1..40 × doğru/yanlış × her etiket × Ayna varyantları)', () => {
    const etiketler = [undefined, ...ICERIK.hataEtiketleri.map((h) => h.id)];
    let sahne = 0;
    for (let n = 1; n <= 40; n++) {
      for (const dogru of [true, false]) {
        for (const etiket of etiketler) {
          for (const aynaVaryant of ['yok', 'okundu', 'kirdi'] as const) {
            const gecmis: SahneGecmisi[] = Array.from({ length: n }, (_, i) => ({ dogru: i % 2 === 0, hataEtiketleri: ['capalama'] }));
            gecmis[n - 1] = { dogru, hataEtiketleri: etiket ? [etiket] : [] };
            if (aynaVaryant !== 'yok') {
              // Üç Ayna karşılaşması: son vaka Ayna vakası (eşik 3 → takım Ayna'yı konuşur).
              for (const i of [0, Math.floor(n / 2), n - 1]) if (gecmis[i]) gecmis[i]!.ayna = { etiket: 'capalama', okundu: aynaVaryant === 'okundu' };
              if (n < 3) continue;
            }
            const s = takimSahnesi(gecmis, 'Deniz');
            expect(s).not.toBeNull();
            sahne++;
            const roller = s!.satirlar.map((x) => x.rol);
            for (let i = 1; i < roller.length; i++) expect(roller[i], `n=${n} ${dogru} ${etiket} ${aynaVaryant}: ${roller.join('>')}`).not.toBe(roller[i - 1]);
            // Yapı korunur: tepki + (Ayna) + arka plan + karşılık + kapanış; arka plan anlatıcısı satırlarda var.
            expect(s!.satirlar.some((x) => x.rol === s!.arkaPlan.rol && x.metin === s!.arkaPlan.metin)).toBe(true);
            expect(s!.satirlar.length).toBeGreaterThanOrEqual(4);
            expect(takimSahnesi(gecmis, 'Deniz')).toEqual(s);
          }
        }
      }
    }
    expect(sahne).toBeGreaterThan(2000);
  });

  it('dört üyenin arkı 16 vakada dörder kez ilerler (rol kaydırması arkı boğmaz)', () => {
    const sayac: Record<string, number> = {};
    for (let n = 1; n <= 16; n++) {
      const gecmis: SahneGecmisi[] = Array.from({ length: n }, () => ({ dogru: false, hataEtiketleri: ['asiri-ozguven'] }));
      const s = takimSahnesi(gecmis, 'Deniz')!;
      sayac[s.arkaPlan.rol] = (sayac[s.arkaPlan.rol] ?? 0) + 1;
    }
    for (const rol of ['lider', 'sorgucu', 'inanan', 'saha']) expect(sayac[rol] ?? 0, rol).toBeGreaterThanOrEqual(3);
  });
});
