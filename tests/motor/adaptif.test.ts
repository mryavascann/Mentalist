// Adaptif vaka üretimi (TASARIM §11, Ericsson 1993 bilinçli pratik): kör nokta profili → sonraki vaka
// o zayıflığı çalıştıracak biçimde üretilir (oyuncuya söylenmeden). Etiket → yapısal hedef eşlemesi:
//   othello-hatasi → gergin masum (sırrı olay anını kapsayan masum) garanti
//   erken-delil → failin gömülü yalanı (SUE belirleyici)
//   gecersiz-gizli-bilgi-testi → yöntem sızmış (oyuncu kontrol etmeyi öğrensin)
//   sahte-itiraf-kabulu → telkine yatkın masum var
//   delil-sorgulanmadi → sahnelenmiş delil var
//   dogruluk-yanliligi → suç var (kaza değil)
import { describe, it, expect } from 'vitest';
import { hedeflerdenAyar, vakaHedefiSaglar, vakaUretHedefli, HEDEF_ETIKETLERI } from '@motor/adaptif';
import type { VakaHedefi } from '@motor/adaptif';
import { sorguBaslat } from '@motor/teknik';

const seedler = Array.from({ length: 40 }, (_, i) => `adaptif-${i}`);

describe('hedeflerdenAyar', () => {
  it('kör nokta etiketlerini yapısal hedeflere çevirir; bilinmeyen etiket yok sayılır; en fazla 2 hedef', () => {
    expect(hedeflerdenAyar([{ etiket: 'othello-hatasi', sayi: 3 }, { etiket: 'erken-delil', sayi: 1 }, { etiket: 'uydurma', sayi: 9 }])).toEqual(['gergin-masum', 'gomulu-yalan']);
    expect(hedeflerdenAyar([{ etiket: 'delil-sorgulanmadi', sayi: 1 }, { etiket: 'gecersiz-gizli-bilgi-testi', sayi: 1 }, { etiket: 'sahte-itiraf-kabulu', sayi: 1 }]).length).toBe(2);
    expect(hedeflerdenAyar([])).toEqual([]);
    for (const e of HEDEF_ETIKETLERI) expect(hedeflerdenAyar([{ etiket: e, sayi: 1 }]).length).toBe(1);
  });
});

describe('vakaUretHedefli', () => {
  it('deterministik; hedefsiz çağrı çözülebilir vaka verir', () => {
    const a = vakaUretHedefli('h-0', [], { zorluk: 'orta' });
    const b = vakaUretHedefli('h-0', [], { zorluk: 'orta' });
    expect(a.vaka).toEqual(b.vaka);
    expect(a.rapor.cozulebilir).toBe(true);
    expect(a.saglananHedefler).toEqual([]);
  });

  const hedefler: VakaHedefi[] = ['gergin-masum', 'gomulu-yalan', 'sizinti', 'telkine-yatkin-masum', 'sahnelenmis-delil', 'suc-var'];
  for (const h of hedefler) {
    it(`hedef "${h}" vakaların en az %85'inde sağlanır ve vaka çözülebilir kalır`, () => {
      let saglanan = 0;
      for (const s of seedler) {
        const r = vakaUretHedefli(s, [h], { zorluk: h === 'sahnelenmis-delil' ? 'zor' : 'orta' });
        expect(r.rapor.cozulebilir).toBe(true);
        if (r.saglananHedefler.includes(h)) {
          saglanan++;
          expect(vakaHedefiSaglar(sorguBaslat(r.vaka), h)).toBe(true);
        }
        expect(r.deneme).toBeLessThanOrEqual(30);
      }
      expect(saglanan / seedler.length).toBeGreaterThanOrEqual(0.85);
    });
  }

  it('iki hedef birlikte sağlanabilir (gergin masum + gömülü yalan) çoğu vakada', () => {
    let ikisi = 0;
    for (const s of seedler) {
      const r = vakaUretHedefli(s, ['gergin-masum', 'gomulu-yalan'], { zorluk: 'orta' });
      if (r.saglananHedefler.length === 2) ikisi++;
    }
    expect(ikisi / seedler.length).toBeGreaterThanOrEqual(0.7);
  });

  it('kör nokta olmayan oyuncu için hedefsiz üretim, olan için hedefli üretim aynı seed\'de farklı vaka verebilir', () => {
    const hedefsiz = vakaUretHedefli('fark', [], { zorluk: 'orta' });
    const hedefli = vakaUretHedefli('fark', ['sizinti'], { zorluk: 'orta' });
    expect(hedefli.saglananHedefler).toContain('sizinti');
    expect(vakaHedefiSaglar(sorguBaslat(hedefli.vaka), 'sizinti')).toBe(true);
    // hedefsiz olan zaten sızıntılıysa aynı olabilir; değilse seed türevi kullanılmıştır
    if (!vakaHedefiSaglar(sorguBaslat(hedefsiz.vaka), 'sizinti')) expect(hedefli.vaka.seed).not.toBe(hedefsiz.vaka.seed);
  });
});
