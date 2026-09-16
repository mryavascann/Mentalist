// Takım arka plan hikâyesi (TASARIM §14): vakalar arası kısa ofis sahneleri. Her sahne son vakaya tepki,
// bir üyenin geçmişinden bir parça ve bir Kılavuz bağı içerir. Ayrıca Ayna'nın depo bütünleşmesi:
// kadans geldiğinde vaka açılışında not, suçlama sonrası "okundun mu" kaydı, kayıtla taşınma.
import { describe, it, expect } from 'vitest';
import { ICERIK } from '@icerik/index';
import { takimSahnesi, TAKIM_ARKI } from '@arayuz/oyun/takim_hikaye';
import { TAKIM } from '@arayuz/oyun/takim';
import { OyunDeposu, type VakaGecmisi } from '@arayuz/oyun/depo';
import { AYNA_KADANSI } from '@motor/ayna';

const KILAVUZ_IDLER = new Set(ICERIK.kilavuz.map((m) => m.id));
const gecmisUret = (n: number, dogru: boolean, etiketler: string[] = []): VakaGecmisi[] =>
  Array.from({ length: n }, (_, i) => ({ seed: `g-${i}`, dogru, puan: dogru ? 80 : 20, hataEtiketleri: dogru ? [] : etiketler, brier: dogru ? 0.05 : 0.6 }));

describe('takım arkı içeriği', () => {
  it('dört üyenin her birinin ≥4 bölümlük geçmişi var; her bölüm bir Kılavuz maddesine bağlı ve dolu', () => {
    for (const u of TAKIM) {
      const ark = TAKIM_ARKI[u.rol];
      expect(ark.length, u.rol).toBeGreaterThanOrEqual(4);
      for (const b of ark) {
        expect(b.metin.length).toBeGreaterThan(40);
        expect(KILAVUZ_IDLER.has(b.kilavuz), `${u.rol}: ${b.kilavuz}`).toBe(true);
      }
    }
  });
});

describe('takım sahnesi', () => {
  it('her vaka sayısında (1..16) sahne üretir; deterministik; boş ya da bozuk satır yok; kahraman adı geçer', () => {
    for (let n = 1; n <= 16; n++) {
      const g = gecmisUret(n, n % 2 === 0, ['othello-hatasi']);
      const s1 = takimSahnesi(g, 'Deniz')!;
      const s2 = takimSahnesi(g, 'Deniz');
      expect(s1).toEqual(s2);
      expect(s1.satirlar.length).toBeGreaterThanOrEqual(3);
      for (const satir of s1.satirlar) {
        expect(satir.metin.length).toBeGreaterThan(5);
        expect(satir.metin).not.toMatch(/undefined|\[object|NaN/);
        expect(TAKIM.some((u) => u.ad === satir.ad && u.rol === satir.rol)).toBe(true);
      }
      expect(KILAVUZ_IDLER.has(s1.kilavuz)).toBe(true);
      expect(s1.satirlar.some((x) => x.metin.includes('Deniz'))).toBe(true);
    }
  });

  it('geçmiş boşsa sahne yok; doğru ve yanlış sonuç farklı tepki üretir; hata etiketi ilgili üyeyi konuşturur', () => {
    expect(takimSahnesi([], 'Deniz')).toBeNull();
    const dogru = takimSahnesi(gecmisUret(1, true), 'Deniz')!;
    const yanlis = takimSahnesi(gecmisUret(1, false, ['sosyal-kanit']), 'Deniz')!;
    expect(dogru.satirlar[0]!.metin).not.toBe(yanlis.satirlar[0]!.metin);
    // Sosyal kanıt hatasında ilk tepkiyi saha ajanı (çoğunluğu seslendiren) verir; Othello'da sorgucu.
    expect(yanlis.satirlar[0]!.rol).toBe('saha');
    expect(takimSahnesi(gecmisUret(1, false, ['othello-hatasi']), 'Deniz')!.satirlar[0]!.rol).toBe('sorgucu');
  });

  it('arka plan bölümleri vaka sayısıyla ilerler: 16 vakada en az 12 farklı bölüm açılır ve sıra üyeler arasında döner', () => {
    const bolumler = new Set<string>();
    const roller: string[] = [];
    for (let n = 1; n <= 16; n++) {
      const s = takimSahnesi(gecmisUret(n, true), 'Deniz')!;
      bolumler.add(s.arkaPlan.metin);
      roller.push(s.arkaPlan.rol);
    }
    expect(bolumler.size).toBeGreaterThanOrEqual(12);
    expect(new Set(roller.slice(0, 4)).size).toBe(4);
  });
});

describe('OyunDeposu — Ayna bütünleşmesi', () => {
  const korGecmis = () => gecmisUret(AYNA_KADANSI, false, ['othello-hatasi', 'tek-ipucu']);

  it('kadans gelmemişse Ayna yok; geldiğinde not var ve tahmin oyuncuya gösterilmez', () => {
    const d1 = new OyunDeposu();
    d1.basla('Deniz');
    d1.yeniVaka('ayna-depo-0');
    expect(d1.durum.ayna).toBeNull();

    const d2 = new OyunDeposu();
    d2.basla('Deniz');
    d2.durum.gecmis = korGecmis();
    d2.yeniVaka('ayna-depo-1');
    const a = d2.durum.ayna!;
    expect(a).not.toBeNull();
    expect(a.not).toContain('Deniz');
    expect(a.etiket).toBe('othello-hatasi');
    expect(a.tahmin === null || d2.durum.sorgu!.durum.vaka.kisiler.some((k) => k.id === a.tahmin)).toBe(true);
    // Brifing notu tahmini adıyla vermez.
    if (a.tahmin) expect(a.not).not.toContain(d2.durum.sorgu!.durum.vaka.kisiler.find((k) => k.id === a.tahmin)!.ad);
  });

  it('suçlama sonrası geçmiş kaydı Ayna sonucunu tutar; tahmin edilen kişi suçlanırsa "okundu"; kayıtla taşınır', () => {
    const depo = new OyunDeposu();
    depo.basla('Deniz');
    depo.durum.gecmis = korGecmis();
    // Tahmini null olmayan bir vaka bul (othello → en kaygılı kişi; her vakada vardır).
    depo.yeniVaka('ayna-depo-2');
    const a = depo.durum.ayna!;
    expect(a.tahmin).not.toBeNull();

    const disa = depo.disaAktar();
    const kopya = new OyunDeposu();
    expect(kopya.iceAktar(disa)).toBe(true);
    expect(kopya.durum.ayna).toEqual(a);

    depo.suclamaYap({ fail: a.tahmin, guven: 0.7 });
    const son = depo.durum.gecmis[depo.durum.gecmis.length - 1]!;
    expect(son.ayna).toEqual({ etiket: 'othello-hatasi', okundu: true });

    // Başka birini suçlayan oyuncu okunmamış sayılır.
    const depo2 = new OyunDeposu();
    depo2.basla('Deniz');
    depo2.durum.gecmis = korGecmis();
    depo2.yeniVaka('ayna-depo-2');
    const vaka = depo2.durum.sorgu!.durum.vaka;
    const baskasi = vaka.kisiler.find((k) => k.hayatta && k.id !== vaka.olay.kurban && k.id !== depo2.durum.ayna!.tahmin)!;
    depo2.suclamaYap({ fail: baskasi.id, guven: 0.7 });
    expect(depo2.durum.gecmis[depo2.durum.gecmis.length - 1]!.ayna).toEqual({ etiket: 'othello-hatasi', okundu: false });

    // Ayna olmayan vakada kayıt alanı yok.
    const depo3 = new OyunDeposu();
    depo3.basla('Deniz');
    depo3.yeniVaka('ayna-depo-3');
    const v3 = depo3.durum.sorgu!.durum.vaka;
    depo3.suclamaYap({ fail: v3.kisiler.find((k) => k.hayatta && k.id !== v3.olay.kurban)!.id, guven: 0.5 });
    expect(depo3.durum.gecmis[0]!.ayna).toBeUndefined();
  });
});
