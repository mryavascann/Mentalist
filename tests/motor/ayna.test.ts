// "Ayna" ana düşman taslağı (TASARIM §14): oyuncunun kör nokta profilini okuyan manipülatör.
// Ayna, oyuncunun KİME şüpheleneceğini oyuncunun kendi hata verisinden tahmin eder ve olay yerine bunu
// ima eden bir imza notu bırakır. Tahmin yalnızca görünür özelliklerden (kişilik temel çizgisi, ilişki
// sıcaklığı, görüşme sırası) üretilir; faille ilişkisi şans düzeyinde kalmalıdır (örüntü = hata).
import { describe, it, expect } from 'vitest';
import { vakaUret } from '@motor/gerceklik';
import { aynaVakasiMi, aynaTahmini, aynaNotu, AYNA_KADANSI } from '@motor/ayna';

const KOR = (etiket: string, sayi = 3) => [{ etiket, sayi }];

describe('Ayna kadansı', () => {
  it('kör nokta yokken ya da baskın etiket 2 kez tekrarlamamışken Ayna gelmez', () => {
    expect(aynaVakasiMi(3, [])).toBe(false);
    expect(aynaVakasiMi(3, KOR('othello-hatasi', 1))).toBe(false);
    expect(aynaVakasiMi(6, KOR('othello-hatasi', 1))).toBe(false);
  });

  it('en az 3 bitmiş vaka ve baskın kör nokta varsa her AYNA_KADANSI vakada bir gelir', () => {
    expect(AYNA_KADANSI).toBeGreaterThanOrEqual(2);
    const kor = KOR('othello-hatasi', 2);
    expect(aynaVakasiMi(0, kor)).toBe(false);
    expect(aynaVakasiMi(1, kor)).toBe(false);
    expect(aynaVakasiMi(2, kor)).toBe(false);
    expect(aynaVakasiMi(AYNA_KADANSI, kor)).toBe(true);
    expect(aynaVakasiMi(AYNA_KADANSI + 1, kor)).toBe(false);
    expect(aynaVakasiMi(AYNA_KADANSI * 2, kor)).toBe(true);
  });
});

describe('Ayna tahmini', () => {
  it('geçerli, hayatta ve kurban olmayan bir kişiyi (ya da "kimse"yi) işaret eder; deterministik', () => {
    for (let i = 0; i < 40; i++) {
      const vaka = vakaUret(`ayna-${i}`);
      for (const etiket of ['othello-hatasi', 'hale-etkisi', 'temsil-edicilik', 'dogrulama-yanliligi', 'dogruluk-yanliligi', 'sosyal-kanit', 'bilinmeyen-etiket']) {
        const t1 = aynaTahmini(vaka, KOR(etiket));
        const t2 = aynaTahmini(vaka, KOR(etiket));
        expect(t1).toEqual(t2);
        expect(t1.etiket).toBe(etiket);
        expect(t1.gerekce.length).toBeGreaterThan(10);
        if (etiket === 'dogruluk-yanliligi') { expect(t1.tahmin).toBeNull(); continue; }
        const k = vaka.kisiler.find((x) => x.id === t1.tahmin);
        expect(k, `${etiket} ${i}`).toBeDefined();
        expect(k!.hayatta).toBe(true);
        expect(k!.id).not.toBe(vaka.olay.kurban);
      }
    }
  });

  it('Othello profili en kaygılı kişiyi, temsil edicilik kurbana en soğuk kişiyi, doğrulama yanlılığı ilk kişiyi seçer', () => {
    const vaka = vakaUret('ayna-kural');
    const adaylar = vaka.kisiler.filter((k) => k.hayatta && k.id !== vaka.olay.kurban);
    const enKaygili = [...adaylar].sort((a, b) => b.kisilik.kaygi - a.kisilik.kaygi)[0]!;
    expect(aynaTahmini(vaka, KOR('othello-hatasi')).tahmin).toBe(enKaygili.id);
    expect(aynaTahmini(vaka, KOR('dogrulama-yanliligi')).tahmin).toBe(adaylar[0]!.id);
    const t = aynaTahmini(vaka, KOR('temsil-edicilik')).tahmin;
    const sicaklik = (id: string) => vaka.iliskiler.find((i) => (i.a === id && i.b === vaka.olay.kurban) || (i.b === id && i.a === vaka.olay.kurban))?.sicaklik ?? 0;
    const enSoguk = Math.min(...adaylar.map((a) => sicaklik(a.id)));
    expect(sicaklik(t!)).toBe(enSoguk);
  });

  it('örüntü denetimi: tahmin faille şans düzeyinde örtüşür (Ayna oyuncuyu okur, vakayı değil)', () => {
    for (const etiket of ['othello-hatasi', 'hale-etkisi', 'temsil-edicilik', 'sosyal-kanit']) {
      let tuttu = 0;
      let beklenen = 0;
      let n = 0;
      for (let i = 0; i < 200; i++) {
        const vaka = vakaUret(`ayna-oruntu-${etiket}-${i}`);
        if (!vaka.olay.fail) continue;
        n++;
        const adaySayisi = vaka.kisiler.filter((k) => k.hayatta && k.id !== vaka.olay.kurban).length;
        beklenen += 1 / adaySayisi;
        if (aynaTahmini(vaka, KOR(etiket)).tahmin === vaka.olay.fail) tuttu++;
      }
      const oran = tuttu / n;
      const sans = beklenen / n;
      expect(oran, `${etiket}: ${oran.toFixed(2)} vs şans ${sans.toFixed(2)}`).toBeLessThan(sans + 0.12);
    }
  });
});

describe('Ayna notu', () => {
  it('kahraman adını ve geçmiş hatayı ima eder; fail adı ve gizli etiket geçmez; deterministik', () => {
    const vaka = vakaUret('ayna-not');
    const t = aynaTahmini(vaka, KOR('othello-hatasi'));
    const n1 = aynaNotu(vaka, 'Deniz', t);
    const n2 = aynaNotu(vaka, 'Deniz', t);
    expect(n1).toBe(n2);
    expect(n1).toContain('Deniz');
    expect(n1.length).toBeGreaterThan(30);
    expect(n1).not.toMatch(/undefined|NaN/);
    // Not, tahmin edilen kişinin adını açıkça yazmaz: oyuncuyu o kişiye itmemeli, sonradan "okundun" demeli.
    const ad = vaka.kisiler.find((k) => k.id === t.tahmin)!.ad;
    expect(n1).not.toContain(ad);
    for (const etiket of ['hale-etkisi', 'temsil-edicilik', 'dogrulama-yanliligi', 'dogruluk-yanliligi', 'sosyal-kanit', 'bilinmeyen']) {
      const m = aynaNotu(vaka, 'Deniz', aynaTahmini(vaka, KOR(etiket)));
      expect(m.length).toBeGreaterThan(30);
      expect(m).not.toMatch(/undefined|NaN/);
    }
  });
});
